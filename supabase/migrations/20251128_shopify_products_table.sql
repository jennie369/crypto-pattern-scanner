-- =====================================================
-- SHOPIFY PRODUCTS TABLE
-- Date: 2025-11-28
-- Description: Create shopify_products table for Edge function
-- The Edge function (shopify-products) expects this table
-- =====================================================

-- Create the shopify_products table that Edge function uses
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  description_html TEXT,
  handle TEXT,
  product_type TEXT,
  vendor TEXT DEFAULT 'Yinyang Masters',
  tags TEXT[],

  -- Pricing
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  currency TEXT DEFAULT 'VND',

  -- Images
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,

  -- Variants & Options
  variants JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,

  -- Status & Inventory
  status TEXT DEFAULT 'active',
  inventory_quantity INT DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny',

  -- Timestamps
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopify_products_handle ON shopify_products(handle);
CREATE INDEX IF NOT EXISTS idx_shopify_products_status ON shopify_products(status);
CREATE INDEX IF NOT EXISTS idx_shopify_products_tags ON shopify_products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_shopify_products_title ON shopify_products USING gin(to_tsvector('english', title));

-- Enable RLS
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON shopify_products;
DROP POLICY IF EXISTS "Service role full access" ON shopify_products;

-- Anyone can read active products
CREATE POLICY "Anyone can view active products"
  ON shopify_products FOR SELECT
  USING (status = 'active');

-- Service role can do everything (for Shopify sync)
CREATE POLICY "Service role full access"
  ON shopify_products FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Update trigger
CREATE OR REPLACE FUNCTION update_shopify_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shopify_products_timestamp ON shopify_products;
CREATE TRIGGER update_shopify_products_timestamp
  BEFORE UPDATE ON shopify_products
  FOR EACH ROW EXECUTE FUNCTION update_shopify_products_updated_at();

-- Verification
SELECT 'shopify_products table created' as status;
