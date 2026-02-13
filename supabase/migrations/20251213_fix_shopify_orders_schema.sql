-- =====================================================
-- FIX SHOPIFY_ORDERS SCHEMA FOR ORDER TRACKING V3
-- Date: 2025-12-13
-- Problem: Missing columns (email, order_number, etc.)
-- Solution: Add all required columns if not exists
-- =====================================================

-- 1. Add ALL required columns to shopify_orders if not exists
DO $$
BEGIN
  -- order_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN order_number TEXT;
    RAISE NOTICE 'Added order_number column';
  END IF;

  -- email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column';
  END IF;

  -- phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN phone TEXT;
    RAISE NOTICE 'Added phone column';
  END IF;

  -- subtotal_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'subtotal_price'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN subtotal_price DECIMAL(12,2);
    RAISE NOTICE 'Added subtotal_price column';
  END IF;

  -- total_discounts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'total_discounts'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN total_discounts DECIMAL(12,2) DEFAULT 0;
    RAISE NOTICE 'Added total_discounts column';
  END IF;

  -- line_items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'line_items'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN line_items JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added line_items column';
  END IF;

  -- shipping_address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN shipping_address JSONB;
    RAISE NOTICE 'Added shipping_address column';
  END IF;

  -- tracking_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN tracking_number TEXT;
    RAISE NOTICE 'Added tracking_number column';
  END IF;

  -- tracking_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'tracking_url'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN tracking_url TEXT;
    RAISE NOTICE 'Added tracking_url column';
  END IF;

  -- carrier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN carrier TEXT;
    RAISE NOTICE 'Added carrier column';
  END IF;

  -- paid_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN paid_at TIMESTAMPTZ;
    RAISE NOTICE 'Added paid_at column';
  END IF;

  -- fulfilled_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'fulfilled_at'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN fulfilled_at TIMESTAMPTZ;
    RAISE NOTICE 'Added fulfilled_at column';
  END IF;

  -- customer_email (alias)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN customer_email TEXT;
    RAISE NOTICE 'Added customer_email column';
  END IF;

END $$;

-- 2. Add linked_emails to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linked_emails'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linked_emails TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added linked_emails column to profiles';
  END IF;
END $$;

-- 3. Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_shopify_orders_email ON shopify_orders(email);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_order_number ON shopify_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_financial_status ON shopify_orders(financial_status);

-- 4. Enable RLS
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to recreate
DROP POLICY IF EXISTS "Users view own orders" ON shopify_orders;
DROP POLICY IF EXISTS "Users view orders by email" ON shopify_orders;
DROP POLICY IF EXISTS "Users view linked email orders" ON shopify_orders;
DROP POLICY IF EXISTS "Service role full access" ON shopify_orders;
DROP POLICY IF EXISTS "Users can link orders" ON shopify_orders;

-- 6. Create RLS policy for users to view their own orders
CREATE POLICY "Users view own orders" ON shopify_orders
FOR SELECT USING (
  auth.uid() = user_id
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR email = ANY(
    SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
  )
);

-- 7. Allow users to update orders they own (for linking)
CREATE POLICY "Users can link orders" ON shopify_orders
FOR UPDATE USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR email = ANY(
    SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  user_id = auth.uid()
);

-- 8. Service role has full access (for webhooks)
CREATE POLICY "Service role full access" ON shopify_orders
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 9. Create trigger to keep email and customer_email in sync
CREATE OR REPLACE FUNCTION sync_shopify_order_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NULL AND NEW.customer_email IS NOT NULL THEN
    NEW.email := NEW.customer_email;
  END IF;
  IF NEW.customer_email IS NULL AND NEW.email IS NOT NULL THEN
    NEW.customer_email := NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_order_email ON shopify_orders;
CREATE TRIGGER sync_order_email
  BEFORE INSERT OR UPDATE ON shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_shopify_order_email();

-- 10. Verify columns
DO $$
DECLARE
  col_list TEXT;
BEGIN
  SELECT string_agg(column_name, ', ') INTO col_list
  FROM information_schema.columns
  WHERE table_name = 'shopify_orders'
    AND column_name IN ('email', 'order_number', 'user_id', 'financial_status', 'fulfillment_status', 'line_items', 'tracking_number');

  RAISE NOTICE 'shopify_orders columns found: %', col_list;
END $$;

SELECT 'shopify_orders schema fix complete!' as result;
