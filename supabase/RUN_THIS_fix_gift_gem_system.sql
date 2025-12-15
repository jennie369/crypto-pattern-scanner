-- ============================================
-- FIX Gift Catalog Images & Gem Spending
-- RUN THIS FILE DIRECTLY IN SUPABASE SQL EDITOR
-- Date: 2024-12-12
-- ============================================

-- ============================================
-- 1. UPDATE GIFT CATALOG WITH EMOJI IMAGES
-- ============================================

-- Clear and repopulate gift catalog
TRUNCATE TABLE sent_gifts CASCADE;
TRUNCATE TABLE gift_catalog CASCADE;

-- Insert new gift catalog with proper emoji image URLs
INSERT INTO gift_catalog (name, description, image_url, gem_cost, category, is_animated, display_order) VALUES
  -- Standard Category (10-50 gems)
  ('Trái Tim', 'Gửi tình yêu', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2764-fe0f.png', 10, 'standard', FALSE, 1),
  ('Ngôi Sao', 'Bạn là ngôi sao!', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2b50.png', 15, 'standard', FALSE, 2),
  ('Hoa Hồng', 'Bông hồng xinh đẹp', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f339.png', 25, 'standard', FALSE, 3),
  ('Bó Hoa', 'Bó hoa tươi thắm', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f490.png', 35, 'standard', FALSE, 4),
  ('Cầu Vồng', 'Sắc màu rực rỡ', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f308.png', 50, 'standard', FALSE, 5),

  -- Premium Category (75-200 gems)
  ('Kim Cương', 'Quà cao cấp', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f48e.png', 75, 'premium', FALSE, 6),
  ('Vương Miện', 'Hoàng tộc', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f451.png', 100, 'premium', FALSE, 7),
  ('Rocket', 'To the moon!', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f680.png', 150, 'premium', FALSE, 8),
  ('Ngọc Trai', 'Quý giá', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f9ca.png', 200, 'premium', FALSE, 9),

  -- Luxury Category (300-1000 gems)
  ('Hộp Quà', 'Hộp quà bí ẩn', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f381.png', 300, 'luxury', FALSE, 10),
  ('Cúp Vàng', 'Chiến thắng', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c6.png', 500, 'luxury', FALSE, 11),
  ('Đá Quý', 'Hiếm và đẹp', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f48d.png', 750, 'luxury', FALSE, 12),
  ('Ngôi Sao Vàng', 'Siêu sao', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f31f.png', 1000, 'luxury', TRUE, 13),

  -- Animated Category (special effects)
  ('Pháo Hoa', 'Lễ hội!', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f386.png', 200, 'animated', TRUE, 14),
  ('Bóng Bay', 'Bay cao!', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f388.png', 100, 'animated', TRUE, 15),
  ('Lấp Lánh', 'Lung linh', 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2728.png', 150, 'animated', TRUE, 16)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. DROP ALL EXISTING spend_gems FUNCTIONS
-- ============================================

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'spend_gems'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.func_signature;
    END LOOP;
END $$;

-- ============================================
-- 3. CREATE spend_gems RPC FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION spend_gems(
  p_amount INT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_balance INT;
  v_wallet_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chưa đăng nhập');
  END IF;

  -- Get current balance from profiles.gems (single source of truth)
  SELECT gems INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id;

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;

  -- Check if enough gems
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không đủ gems',
      'balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  -- Deduct from profiles.gems
  UPDATE profiles
  SET gems = gems - p_amount
  WHERE id = v_user_id;

  -- Also sync to user_wallets if exists (backwards compatibility)
  UPDATE user_wallets
  SET gem_balance = gem_balance - p_amount,
      total_spent = COALESCE(total_spent, 0) + p_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Get wallet_id for transaction record
  SELECT id INTO v_wallet_id FROM user_wallets WHERE user_id = v_user_id;

  -- Record transaction in wallet_transactions if wallet exists
  IF v_wallet_id IS NOT NULL THEN
    INSERT INTO wallet_transactions (
      wallet_id,
      type,
      currency,
      amount,
      description,
      reference_id,
      reference_type
    ) VALUES (
      v_wallet_id,
      'spend',
      'gem',
      -p_amount,
      p_description,
      p_reference_id,
      p_reference_type
    );
  END IF;

  -- Also record in gems_transactions for unified tracking
  INSERT INTO gems_transactions (
    user_id,
    type,
    amount,
    description,
    reference_id,
    reference_type
  ) VALUES (
    v_user_id,
    'spend',
    -p_amount,
    p_description,
    CASE WHEN p_reference_id IS NOT NULL AND p_reference_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         THEN p_reference_id::UUID
         ELSE NULL
    END,
    p_reference_type
  ) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_current_balance - p_amount,
    'spent', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION spend_gems(INT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- 4. DROP ALL EXISTING receive_gems FUNCTIONS
-- ============================================

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'receive_gems'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.func_signature;
    END LOOP;
END $$;

-- ============================================
-- 5. CREATE receive_gems RPC FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION receive_gems(
  p_recipient_id UUID,
  p_amount INT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS JSONB AS $$
BEGIN
  -- Add to recipient's profiles.gems
  UPDATE profiles
  SET gems = COALESCE(gems, 0) + p_amount
  WHERE id = p_recipient_id;

  -- Also sync to user_wallets if exists
  UPDATE user_wallets
  SET gem_balance = COALESCE(gem_balance, 0) + p_amount,
      total_earned = COALESCE(total_earned, 0) + p_amount,
      updated_at = NOW()
  WHERE user_id = p_recipient_id;

  -- Record in gems_transactions
  INSERT INTO gems_transactions (
    user_id,
    type,
    amount,
    description,
    reference_id,
    reference_type
  ) VALUES (
    p_recipient_id,
    'receive',
    p_amount,
    p_description,
    CASE WHEN p_reference_id IS NOT NULL AND p_reference_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         THEN p_reference_id::UUID
         ELSE NULL
    END,
    p_reference_type
  ) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'added', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION receive_gems(UUID, INT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- 6. CREATE gems_transactions TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('spend', 'receive', 'purchase', 'bonus', 'refund')),
  amount INT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gems_transactions_user ON gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created ON gems_transactions(created_at DESC);

-- RLS for gems_transactions
ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gem transactions" ON gems_transactions;
CREATE POLICY "Users can view own gem transactions" ON gems_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert gem transactions" ON gems_transactions;
CREATE POLICY "System can insert gem transactions" ON gems_transactions
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DONE! Gift system is now complete.
-- ============================================
SELECT 'Gift & Gem system migration completed successfully!' AS status;
