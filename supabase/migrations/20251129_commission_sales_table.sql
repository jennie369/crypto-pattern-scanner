-- =====================================================
-- COMMISSION SALES TABLE
-- Date: 2025-11-29
-- Description: Track commission sales from Shopify orders
-- =====================================================

-- Create commission_sales table
CREATE TABLE IF NOT EXISTS commission_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Partner/Affiliate info
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT,

  -- Shopify order info
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,

  -- Order details
  order_total NUMERIC NOT NULL DEFAULT 0,
  product_type TEXT, -- 'digital' or 'physical'
  product_category TEXT, -- 'course', 'scanner', 'chatbot', 'jewelry', etc.
  product_sku TEXT,
  tier_purchased TEXT, -- For tier upgrades

  -- Buyer info
  buyer_email TEXT,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Commission calculation
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.05, -- e.g., 0.05 = 5%
  commission_amount NUMERIC NOT NULL DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),

  -- Timestamps
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_commission_sales_partner ON commission_sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_commission_sales_status ON commission_sales(status);
CREATE INDEX IF NOT EXISTS idx_commission_sales_created ON commission_sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_sales_shopify_order ON commission_sales(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_commission_sales_affiliate_code ON commission_sales(affiliate_code);

-- Enable RLS
ALTER TABLE commission_sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own commission sales" ON commission_sales;
DROP POLICY IF EXISTS "Admins can manage all commission sales" ON commission_sales;
DROP POLICY IF EXISTS "Service role full access commission_sales" ON commission_sales;

-- RLS Policies
-- Users can view their own commission records
CREATE POLICY "Users can view own commission sales"
  ON commission_sales FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid());

-- Admins can manage all records
CREATE POLICY "Admins can manage all commission sales"
  ON commission_sales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role full access (for Edge Functions/webhooks)
CREATE POLICY "Service role full access commission_sales"
  ON commission_sales FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_commission_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_commission_sales ON commission_sales;
CREATE TRIGGER trigger_update_commission_sales
  BEFORE UPDATE ON commission_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_sales_updated_at();

-- Function to record commission from Shopify order
CREATE OR REPLACE FUNCTION record_commission_sale(
  p_partner_id UUID,
  p_affiliate_code TEXT,
  p_shopify_order_id TEXT,
  p_shopify_order_number TEXT,
  p_order_total NUMERIC,
  p_product_type TEXT,
  p_product_category TEXT,
  p_product_sku TEXT,
  p_tier_purchased TEXT,
  p_buyer_email TEXT,
  p_buyer_user_id UUID,
  p_commission_rate NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_commission_amount NUMERIC;
  v_new_id UUID;
BEGIN
  -- Calculate commission
  v_commission_amount := p_order_total * p_commission_rate;

  -- Insert commission record
  INSERT INTO commission_sales (
    partner_id,
    affiliate_code,
    shopify_order_id,
    shopify_order_number,
    order_total,
    product_type,
    product_category,
    product_sku,
    tier_purchased,
    buyer_email,
    buyer_user_id,
    commission_rate,
    commission_amount,
    status
  ) VALUES (
    p_partner_id,
    p_affiliate_code,
    p_shopify_order_id,
    p_shopify_order_number,
    p_order_total,
    p_product_type,
    p_product_category,
    p_product_sku,
    p_tier_purchased,
    p_buyer_email,
    p_buyer_user_id,
    p_commission_rate,
    v_commission_amount,
    'pending'
  )
  RETURNING id INTO v_new_id;

  -- Update partner's total commission and available balance
  UPDATE profiles
  SET
    total_commission = COALESCE(total_commission, 0) + v_commission_amount,
    available_balance = COALESCE(available_balance, 0) + v_commission_amount,
    updated_at = NOW()
  WHERE id = p_partner_id;

  -- Also update affiliate_profiles total_sales if exists
  UPDATE affiliate_profiles
  SET
    total_sales = COALESCE(total_sales, 0) + p_order_total,
    updated_at = NOW()
  WHERE user_id = p_partner_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve commission
CREATE OR REPLACE FUNCTION approve_commission(
  p_commission_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE commission_sales
  SET
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_commission_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark commission as paid
CREATE OR REPLACE FUNCTION mark_commission_paid(
  p_commission_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_commission RECORD;
BEGIN
  -- Get commission record
  SELECT * INTO v_commission
  FROM commission_sales
  WHERE id = p_commission_id AND status = 'approved';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update commission status
  UPDATE commission_sales
  SET
    status = 'paid',
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_commission_id;

  -- Deduct from available balance (already counted when created)
  UPDATE profiles
  SET
    available_balance = COALESCE(available_balance, 0) - v_commission.commission_amount,
    updated_at = NOW()
  WHERE id = v_commission.partner_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'commission_sales table created successfully' as status;
