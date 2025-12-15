-- ============================================
-- Create seed_post_products table
-- Allows tagging Shopify products to seed posts
-- Similar to post_products but for seed_posts table
-- ============================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS seed_post_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES seed_posts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_title TEXT,
  product_price DECIMAL(10, 2),
  product_image TEXT,
  product_handle TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_seed_post_products_post_id
ON seed_post_products(post_id);

CREATE INDEX IF NOT EXISTS idx_seed_post_products_product_id
ON seed_post_products(product_id);

-- Enable RLS
ALTER TABLE seed_post_products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read seed post products
CREATE POLICY "Anyone can read seed post products"
ON seed_post_products FOR SELECT
USING (true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage seed post products"
ON seed_post_products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Add comment
COMMENT ON TABLE seed_post_products IS 'Links Shopify products to seed posts for admin content management';
