-- =====================================================
-- GEM SHOPIFY INTEGRATION
-- Allows users to purchase Gem packages via Shopify checkout
-- =====================================================

-- 1. Ensure gems column exists on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gems INT DEFAULT 0;

-- 2. Add Shopify IDs to currency_packages
ALTER TABLE currency_packages
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT;

-- 3. Update existing packages with SKUs
-- (Shopify IDs will be added manually after creating products on Shopify)
UPDATE currency_packages SET sku = 'gem-pack-100' WHERE gem_amount = 100;
UPDATE currency_packages SET sku = 'gem-pack-500' WHERE gem_amount = 500;
UPDATE currency_packages SET sku = 'gem-pack-1000' WHERE gem_amount = 1000;
UPDATE currency_packages SET sku = 'gem-pack-5000' WHERE gem_amount = 5000;

-- 4. Create pending_gem_purchases table (for users who haven't signed up yet)
CREATE TABLE IF NOT EXISTS pending_gem_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  order_id TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_paid NUMERIC,
  currency TEXT DEFAULT 'VND',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  applied_to_user_id UUID REFERENCES auth.users(id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_gems_email ON pending_gem_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_gems_applied ON pending_gem_purchases(applied);

-- 5. Enable RLS on pending_gem_purchases
ALTER TABLE pending_gem_purchases ENABLE ROW LEVEL SECURITY;

-- Service role full access (for webhook)
DROP POLICY IF EXISTS "Service role full access pending_gems" ON pending_gem_purchases;
CREATE POLICY "Service role full access pending_gems"
  ON pending_gem_purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create gems_transactions table if not exists
CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'purchase', 'gift_sent', 'gift_received', 'bonus', 'spend'
  amount INT NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'shopify_order', 'pending_purchase', 'gift', 'boost', etc.
  reference_id TEXT,
  balance_before INT DEFAULT 0,
  balance_after INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gems_transactions_user ON gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_type ON gems_transactions(type);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created ON gems_transactions(created_at DESC);

-- RLS for gems_transactions
ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON gems_transactions;
CREATE POLICY "Users can view own transactions"
  ON gems_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access gems_transactions" ON gems_transactions;
CREATE POLICY "Service role full access gems_transactions"
  ON gems_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Function to apply pending gems on user signup
CREATE OR REPLACE FUNCTION apply_pending_gems()
RETURNS TRIGGER AS $$
DECLARE
  pending RECORD;
  total_gems INT := 0;
  user_email TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find all pending gem purchases for this email
  FOR pending IN
    SELECT * FROM pending_gem_purchases
    WHERE email = user_email AND applied = FALSE
  LOOP
    total_gems := total_gems + pending.gem_amount;

    -- Mark as applied
    UPDATE pending_gem_purchases
    SET applied = TRUE,
        applied_at = NOW(),
        applied_to_user_id = NEW.id
    WHERE id = pending.id;

    -- Log transaction
    INSERT INTO gems_transactions (user_id, type, amount, description, reference_type, reference_id, balance_before, balance_after)
    VALUES (
      NEW.id,
      'purchase',
      pending.gem_amount,
      'Gems tu don hang truoc khi dang ky',
      'pending_purchase',
      pending.id::TEXT,
      0,
      pending.gem_amount
    );
  END LOOP;

  -- Update user gems balance
  IF total_gems > 0 THEN
    UPDATE profiles SET gems = COALESCE(gems, 0) + total_gems WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profile creation
DROP TRIGGER IF EXISTS trigger_apply_pending_gems ON profiles;
CREATE TRIGGER trigger_apply_pending_gems
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION apply_pending_gems();

-- 8. Helper function to add gems to user (called by webhook)
CREATE OR REPLACE FUNCTION add_gems_to_user(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT,
  p_reference_type TEXT,
  p_reference_id TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS INT AS $$
DECLARE
  current_balance INT;
  new_balance INT;
BEGIN
  -- Get current balance
  SELECT COALESCE(gems, 0) INTO current_balance FROM profiles WHERE id = p_user_id;
  new_balance := current_balance + p_amount;

  -- Update balance
  UPDATE profiles SET gems = new_balance WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO gems_transactions (user_id, type, amount, description, reference_type, reference_id, balance_before, balance_after, metadata)
  VALUES (p_user_id, 'purchase', p_amount, p_description, p_reference_type, p_reference_id, current_balance, new_balance, p_metadata);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
