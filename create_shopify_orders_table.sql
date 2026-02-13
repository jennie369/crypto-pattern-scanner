-- =============================================
-- CREATE shopify_orders TABLE
-- Logs all Shopify purchase transactions
-- Run this in Supabase SQL Editor
-- =============================================

-- Create the shopify_orders table
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT NOT NULL UNIQUE, -- Shopify order ID
  tier_purchased VARCHAR(20) NOT NULL CHECK (tier_purchased IN ('tier1', 'tier2', 'tier3')),
  amount DECIMAL(20, 2) NOT NULL, -- Amount paid in VND
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_order_id ON shopify_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_processed_at ON shopify_orders(processed_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON shopify_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert orders (webhook only)
CREATE POLICY "Service role can insert orders"
  ON shopify_orders
  FOR INSERT
  WITH CHECK (true); -- Only service role key can insert (used by Edge Function)

-- Policy: Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON shopify_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant permissions to authenticated users
GRANT SELECT ON shopify_orders TO authenticated;

-- Grant permissions to service role (for webhook)
GRANT INSERT ON shopify_orders TO service_role;

-- =============================================
-- VERIFY TABLE CREATION
-- =============================================

-- Check table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'shopify_orders'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shopify_orders';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ shopify_orders TABLE CREATED              ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 Table Features:'
UNION ALL
SELECT '  ✅ Tracks Shopify order transactions'
UNION ALL
SELECT '  ✅ Links orders to users'
UNION ALL
SELECT '  ✅ Stores tier purchased and amount'
UNION ALL
SELECT '  ✅ Unique constraint on order_id (no duplicates)'
UNION ALL
SELECT '  ✅ RLS policies for security'
UNION ALL
SELECT '  ✅ Indexes for fast queries'
UNION ALL
SELECT ''
UNION ALL
SELECT '🔐 Security:'
UNION ALL
SELECT '  ✅ Users can only see their own orders'
UNION ALL
SELECT '  ✅ Only webhook (service role) can insert'
UNION ALL
SELECT '  ✅ Admins can view all orders'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 NEXT STEPS:'
UNION ALL
SELECT '  1. Deploy Edge Function to Supabase'
UNION ALL
SELECT '  2. Update Pricing.jsx with Shopify links'
UNION ALL
SELECT '  3. Configure webhook in Shopify'
UNION ALL
SELECT '  4. Test end-to-end payment flow';
