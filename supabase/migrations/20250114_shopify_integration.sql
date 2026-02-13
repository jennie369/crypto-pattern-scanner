-- =====================================================
-- SHOPIFY INTEGRATION - DATABASE SCHEMA
-- =====================================================
-- Created: 2025-01-14
-- Purpose: Store synced Shopify products, orders, and cart data
-- =====================================================

-- ========================================
-- 1. SHOPIFY PRODUCTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS shopify_products (
  id BIGSERIAL PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  description_html TEXT,
  handle TEXT NOT NULL,
  product_type TEXT,
  vendor TEXT,
  tags TEXT[],

  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  currency TEXT DEFAULT 'VND',

  -- Images
  image_url TEXT,
  images JSONB DEFAULT '[]', -- Array of image objects

  -- Variants & Options
  variants JSONB DEFAULT '[]', -- Array of variant objects
  options JSONB DEFAULT '[]', -- Product options (size, color, etc)

  -- Status & Inventory
  status TEXT DEFAULT 'active',
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny', -- 'deny' or 'continue'

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_shopify_products_handle ON shopify_products(handle);
CREATE INDEX IF NOT EXISTS idx_shopify_products_status ON shopify_products(status);
CREATE INDEX IF NOT EXISTS idx_shopify_products_type ON shopify_products(product_type);
CREATE INDEX IF NOT EXISTS idx_shopify_products_vendor ON shopify_products(vendor);
CREATE INDEX IF NOT EXISTS idx_shopify_products_tags ON shopify_products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shopify_products_synced ON shopify_products(synced_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_shopify_products_search
ON shopify_products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

COMMENT ON TABLE shopify_products IS 'Synced Shopify product catalog';

-- ========================================
-- 2. SHOPIFY COLLECTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS shopify_collections (
  id BIGSERIAL PRIMARY KEY,
  shopify_collection_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  handle TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  sort_order TEXT DEFAULT 'manual',
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection-Product junction table
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id BIGINT REFERENCES shopify_collections(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES shopify_products(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);

COMMENT ON TABLE shopify_collections IS 'Shopify product collections (categories)';

-- ========================================
-- 3. SHOPPING CARTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users

  -- Shopify cart data
  shopify_cart_id TEXT, -- Shopify's cart ID
  checkout_url TEXT, -- Shopify checkout URL

  -- Cart items
  items JSONB NOT NULL DEFAULT '[]', -- Array of cart items

  -- Totals
  subtotal DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'VND',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON shopping_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_shopify ON shopping_carts(shopify_cart_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires ON shopping_carts(expires_at);

COMMENT ON TABLE shopping_carts IS 'User shopping carts (with Shopify integration)';

-- ========================================
-- 4. SHOPIFY ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS shopify_orders (
  id BIGSERIAL PRIMARY KEY,
  shopify_order_id TEXT UNIQUE NOT NULL,
  order_number TEXT NOT NULL,

  -- User info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,

  -- Pricing
  total_price DECIMAL(12,2) NOT NULL,
  subtotal_price DECIMAL(12,2),
  total_tax DECIMAL(12,2),
  total_discounts DECIMAL(12,2) DEFAULT 0,
  total_shipping DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'VND',

  -- Status
  financial_status TEXT, -- 'pending', 'paid', 'refunded', etc.
  fulfillment_status TEXT, -- 'fulfilled', 'partial', 'unfulfilled', etc.
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  -- Order details
  line_items JSONB, -- Array of order items
  shipping_address JSONB,
  billing_address JSONB,
  customer JSONB,

  -- Payment
  payment_gateway_names JSONB,

  -- Notes
  note TEXT,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON shopify_orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON shopify_orders(financial_status, fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON shopify_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tags ON shopify_orders USING GIN(tags);

COMMENT ON TABLE shopify_orders IS 'Synced Shopify orders via webhooks';

-- ========================================
-- 5. WEBHOOK LOGS TABLE (for debugging)
-- ========================================
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  shopify_id TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_topic ON shopify_webhook_logs(topic);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON shopify_webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON shopify_webhook_logs(created_at DESC);

COMMENT ON TABLE shopify_webhook_logs IS 'Shopify webhook event logs for debugging';

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Anyone can view published products" ON shopify_products
  FOR SELECT USING (status = 'active' AND published_at IS NOT NULL);

-- Public read access for collections
CREATE POLICY "Anyone can view collections" ON shopify_collections
  FOR SELECT USING (published = true);

-- Cart policies
CREATE POLICY "Users can view their own carts" ON shopping_carts
  FOR SELECT USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can insert their own carts" ON shopping_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts" ON shopping_carts
  FOR UPDATE USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- Order policies
CREATE POLICY "Users can view their own orders" ON shopify_orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    email = auth.jwt()->>'email'
  );

-- ========================================
-- 7. FUNCTIONS & TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_shopify_products_updated_at
  BEFORE UPDATE ON shopify_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopify_collections_updated_at
  BEFORE UPDATE ON shopify_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_carts_updated_at
  BEFORE UPDATE ON shopping_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON shopify_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired carts
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS void AS $$
BEGIN
  DELETE FROM shopping_carts
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. INITIAL DATA (Optional)
-- ========================================

-- Create a default collection for all products
INSERT INTO shopify_collections (shopify_collection_id, title, handle, description)
VALUES ('all-products', 'Tất Cả Sản Phẩm', 'all-products', 'Xem tất cả sản phẩm của chúng tôi')
ON CONFLICT (shopify_collection_id) DO NOTHING;

-- ========================================
-- 9. PERMISSIONS FOR EDGE FUNCTIONS
-- ========================================

-- Grant service role full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant authenticated users read access to products
GRANT SELECT ON shopify_products TO authenticated;
GRANT SELECT ON shopify_collections TO authenticated;
GRANT SELECT ON collection_products TO authenticated;

-- Grant authenticated users full access to their carts
GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_carts TO authenticated;

-- Grant authenticated users read access to their orders
GRANT SELECT ON shopify_orders TO authenticated;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Shopify integration schema created successfully!';
  RAISE NOTICE 'Tables: shopify_products, shopify_collections, shopping_carts, shopify_orders';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy Edge Functions';
  RAISE NOTICE '2. Set environment variables in Supabase';
  RAISE NOTICE '3. Register Shopify webhooks';
END $$;
