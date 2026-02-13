-- Extend affiliate_codes for product-specific affiliate links
-- This enables Shopee-style product sharing with affiliate tracking
-- product_id = NULL → User referral code (existing behavior)
-- product_id != NULL → Product affiliate link (new feature)

-- Add product-related columns to affiliate_codes
-- NOTE: product_id is TEXT because Shopify IDs are numeric strings (e.g., "9732564713776")
-- not UUIDs. We store them as TEXT for compatibility.
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_type TEXT CHECK (product_type IN ('crystal', 'course', 'subscription', 'bundle', 'book'));
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS short_code TEXT;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_price NUMERIC(12, 2);
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Performance tracking columns
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS sales_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS commission_earned NUMERIC(12, 2) DEFAULT 0;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product ON affiliate_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_short_code ON affiliate_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product_type ON affiliate_codes(product_type);

-- Unique constraint: one product link per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_codes_user_product
  ON affiliate_codes(user_id, product_id)
  WHERE product_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN affiliate_codes.product_id IS 'NULL = user referral code, NOT NULL = product affiliate link';
COMMENT ON COLUMN affiliate_codes.short_code IS 'Short code for product URLs (e.g., RQC456)';
COMMENT ON COLUMN affiliate_codes.product_type IS 'Product category: crystal, course, subscription, bundle, book';

-- Function to increment affiliate clicks
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment affiliate clicks by code string
CREATE OR REPLACE FUNCTION increment_affiliate_clicks_by_code(code_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE code = code_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record product affiliate sale
CREATE OR REPLACE FUNCTION record_product_affiliate_sale(
  p_affiliate_link_id UUID,
  p_sale_amount NUMERIC,
  p_commission_amount NUMERIC,
  p_quantity INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  -- Update affiliate_codes stats for the product link
  UPDATE affiliate_codes
  SET
    sales_count = COALESCE(sales_count, 0) + p_quantity,
    sales_amount = COALESCE(sales_amount, 0) + p_sale_amount,
    commission_earned = COALESCE(commission_earned, 0) + p_commission_amount
  WHERE id = p_affiliate_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_affiliate_clicks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_affiliate_clicks_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_product_affiliate_sale(UUID, NUMERIC, NUMERIC, INTEGER) TO authenticated;
