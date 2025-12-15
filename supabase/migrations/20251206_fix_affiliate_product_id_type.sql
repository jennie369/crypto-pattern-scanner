-- Fix affiliate_codes.product_id type from UUID to TEXT
-- This is needed because Shopify product IDs are numeric strings, not UUIDs
-- e.g., "9732564713776"

-- Step 1: Drop the existing column if it's UUID type
-- We need to handle this carefully to preserve any existing data

-- Create a temp column
ALTER TABLE affiliate_codes
ADD COLUMN IF NOT EXISTS product_id_temp TEXT;

-- Copy data if any exists (converting UUID to TEXT)
UPDATE affiliate_codes
SET product_id_temp = product_id::TEXT
WHERE product_id IS NOT NULL;

-- Drop indexes that depend on product_id
DROP INDEX IF EXISTS idx_affiliate_codes_product;
DROP INDEX IF EXISTS idx_affiliate_codes_user_product;

-- Drop the old column if it exists (this handles the UUID column)
-- Using DO block to handle the case where column doesn't exist or has different type
DO $$
BEGIN
  -- Check if product_id column exists and is UUID type
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'affiliate_codes'
    AND column_name = 'product_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop the UUID column
    ALTER TABLE affiliate_codes DROP COLUMN product_id;
    -- Rename temp to product_id
    ALTER TABLE affiliate_codes RENAME COLUMN product_id_temp TO product_id;
  ELSE
    -- If product_id doesn't exist or is already TEXT, just drop temp
    ALTER TABLE affiliate_codes DROP COLUMN IF EXISTS product_id_temp;
    -- Ensure product_id exists as TEXT
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'affiliate_codes'
      AND column_name = 'product_id'
    ) THEN
      ALTER TABLE affiliate_codes ADD COLUMN product_id TEXT;
    END IF;
  END IF;
END $$;

-- Recreate indexes with TEXT type
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product ON affiliate_codes(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_codes_user_product
  ON affiliate_codes(user_id, product_id)
  WHERE product_id IS NOT NULL;

-- Verify the change
COMMENT ON COLUMN affiliate_codes.product_id IS 'Shopify product ID as TEXT (e.g., "9732564713776"). NULL = user referral code, NOT NULL = product affiliate link';
