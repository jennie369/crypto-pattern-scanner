-- ========================================
-- FIX: grant_gems function với đầy đủ 7 tham số
-- Chạy SQL này trong Supabase SQL Editor
-- ========================================

-- Drop existing versions to avoid conflicts
DROP FUNCTION IF EXISTS grant_gems(UUID, INTEGER, TEXT, JSONB);
DROP FUNCTION IF EXISTS grant_gems(UUID, INTEGER, VARCHAR, TEXT, VARCHAR, VARCHAR, JSONB);

-- Create user_wallets table if not exists
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gem_balance INTEGER DEFAULT 0,
  diamond_balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- Create wallet_transactions table if not exists
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  currency VARCHAR(20) DEFAULT 'gem',
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id VARCHAR(100),
  reference_type VARCHAR(50),
  balance_before INTEGER DEFAULT 0,
  balance_after INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add metadata column if missing
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ========================================
-- Main grant_gems function (7 params)
-- ========================================
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
  -- Get or create wallet
  SELECT id, COALESCE(gem_balance, 0) INTO v_wallet_id, v_current_balance
  FROM user_wallets WHERE user_id = p_user_id FOR UPDATE;

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
    total_earned = total_earned + CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
    total_spent = total_spent + CASE WHEN p_amount < 0 THEN ABS(p_amount) ELSE 0 END,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update profiles.gems for compatibility
  UPDATE profiles SET gems = v_new_balance WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO wallet_transactions (
    wallet_id, type, currency, amount, description,
    reference_id, reference_type, balance_before, balance_after, metadata, created_at
  )
  VALUES (
    v_wallet_id, p_type, 'gem', p_amount, p_description,
    p_reference_id, p_reference_type, v_current_balance, v_new_balance, p_metadata, NOW()
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
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ========================================
-- Overload: Simple 4-param version for backward compatibility
-- ========================================
CREATE OR REPLACE FUNCTION grant_gems(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'purchase',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the full version with defaults
  RETURN grant_gems(p_user_id, p_amount, p_reason::VARCHAR(50), p_reason, NULL, NULL, p_metadata);
END;
$$;

-- ========================================
-- Grant permissions
-- ========================================
GRANT EXECUTE ON FUNCTION grant_gems(UUID, INTEGER, VARCHAR, TEXT, VARCHAR, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_gems(UUID, INTEGER, VARCHAR, TEXT, VARCHAR, VARCHAR, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION grant_gems(UUID, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_gems(UUID, INTEGER, TEXT, JSONB) TO service_role;

-- ========================================
-- Test (optional - uncomment to test)
-- ========================================
-- SELECT grant_gems('your-user-uuid-here'::UUID, 100, 'test', 'Test grant', NULL, 'test', '{}');

-- ========================================
-- Verify
-- ========================================
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'grant_gems'
AND n.nspname = 'public';
