-- =====================================================
-- FIX AFFILIATE CODES UNIQUE CONSTRAINT
-- Date: 2025-12-14
-- Problem: affiliate_codes_user_id_key blocks multiple codes per user
-- Solution: Allow multiple codes per user (one referral + multiple products)
-- =====================================================

-- 1. Drop the old unique constraint on user_id (if exists)
-- This was incorrectly blocking users from having multiple affiliate codes
ALTER TABLE affiliate_codes DROP CONSTRAINT IF EXISTS affiliate_codes_user_id_key;

-- 2. Also drop any unique index on just user_id
DROP INDEX IF EXISTS affiliate_codes_user_id_key;
DROP INDEX IF EXISTS idx_affiliate_codes_user_id_unique;

-- 3. Ensure the correct unique constraint exists:
-- - One referral code per user (where product_id IS NULL)
-- - One product link per user per product (user_id + product_id)

-- Unique index for referral codes (product_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_codes_user_referral
  ON affiliate_codes(user_id)
  WHERE product_id IS NULL;

-- Unique index for product links (already exists but recreate to be sure)
DROP INDEX IF EXISTS idx_affiliate_codes_user_product;
CREATE UNIQUE INDEX idx_affiliate_codes_user_product
  ON affiliate_codes(user_id, product_id)
  WHERE product_id IS NOT NULL;

-- 4. Update trigger function to not create duplicate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if no referral code exists for this user
  INSERT INTO affiliate_codes (user_id, code)
  SELECT
    NEW.user_id,
    'GEM' || UPPER(SUBSTRING(NEW.user_id::TEXT FROM 1 FOR 8))
  WHERE NOT EXISTS (
    SELECT 1 FROM affiliate_codes
    WHERE user_id = NEW.user_id AND product_id IS NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Done
SELECT 'Affiliate codes unique constraint fixed!' as result;
