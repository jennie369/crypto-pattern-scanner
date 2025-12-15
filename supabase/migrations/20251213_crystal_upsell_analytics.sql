-- =====================================================
-- CRYSTAL UPSELL ANALYTICS & COMBO TRACKING
-- Date: 2025-12-13
-- Purpose: Track upsell conversions and combo purchases
-- =====================================================

-- 1. Upsell Events Table - Track when upsells are shown and converted
CREATE TABLE IF NOT EXISTS upsell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous tracking

  -- Primary product
  primary_product_id TEXT NOT NULL,
  primary_product_title TEXT,
  primary_product_tags TEXT[],

  -- Upsell context
  source_screen TEXT, -- 'gemmaster', 'iching', 'tarot', 'shop'
  matched_tag TEXT, -- Which tag triggered the upsell

  -- Upsell products shown
  upsell_products JSONB DEFAULT '[]'::jsonb, -- [{id, title, price}]
  upsell_count INT DEFAULT 0,

  -- Conversion tracking
  products_added JSONB DEFAULT '[]'::jsonb, -- Products user added from upsell
  conversion_count INT DEFAULT 0, -- How many upsells were added

  -- Discount info
  combo_discount_percent DECIMAL(5,2) DEFAULT 0,
  potential_savings DECIMAL(12,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'shown', -- 'shown', 'skipped', 'converted', 'checkout'

  -- Timestamps
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  checkout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Combo Purchases Table - Track successful combo orders
CREATE TABLE IF NOT EXISTS combo_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Order info (from Shopify)
  shopify_order_id TEXT,
  order_number TEXT,

  -- Combo details
  item_count INT NOT NULL,
  products JSONB NOT NULL, -- [{id, title, price, quantity}]

  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,

  -- Source tracking
  upsell_event_id UUID REFERENCES upsell_events(id) ON DELETE SET NULL,
  source_screen TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crystal Tag Performance - Track which tags convert best
CREATE TABLE IF NOT EXISTS crystal_tag_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,

  -- Impressions
  times_shown INT DEFAULT 0,
  times_as_primary INT DEFAULT 0,
  times_as_upsell INT DEFAULT 0,

  -- Conversions
  times_added_to_cart INT DEFAULT 0,
  times_purchased INT DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- Calculated metrics (updated by trigger)
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_upsell_events_user ON upsell_events(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_events_status ON upsell_events(status);
CREATE INDEX IF NOT EXISTS idx_upsell_events_source ON upsell_events(source_screen);
CREATE INDEX IF NOT EXISTS idx_upsell_events_shown_at ON upsell_events(shown_at);
CREATE INDEX IF NOT EXISTS idx_combo_purchases_user ON combo_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_combo_purchases_order ON combo_purchases(shopify_order_id);

-- 5. RLS Policies
ALTER TABLE upsell_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_tag_performance ENABLE ROW LEVEL SECURITY;

-- Users can view their own upsell events
CREATE POLICY "Users view own upsell events" ON upsell_events
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own upsell events
CREATE POLICY "Users insert own upsell events" ON upsell_events
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own upsell events
CREATE POLICY "Users update own upsell events" ON upsell_events
FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own combo purchases
CREATE POLICY "Users view own combo purchases" ON combo_purchases
FOR SELECT USING (auth.uid() = user_id);

-- Service role full access for analytics
CREATE POLICY "Service role upsell events" ON upsell_events
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role combo purchases" ON combo_purchases
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Tag performance is read-only for users, writable by service
CREATE POLICY "Anyone can view tag performance" ON crystal_tag_performance
FOR SELECT USING (true);

CREATE POLICY "Service role tag performance" ON crystal_tag_performance
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. RPC: Track upsell shown event
CREATE OR REPLACE FUNCTION track_upsell_shown(
  p_user_id UUID,
  p_session_id TEXT,
  p_primary_product_id TEXT,
  p_primary_product_title TEXT,
  p_primary_product_tags TEXT[],
  p_source_screen TEXT,
  p_matched_tag TEXT,
  p_upsell_products JSONB,
  p_combo_discount_percent DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_upsell_count INT;
BEGIN
  -- Count upsell products
  v_upsell_count := jsonb_array_length(COALESCE(p_upsell_products, '[]'::jsonb));

  -- Insert event
  INSERT INTO upsell_events (
    user_id, session_id,
    primary_product_id, primary_product_title, primary_product_tags,
    source_screen, matched_tag,
    upsell_products, upsell_count,
    combo_discount_percent, status
  ) VALUES (
    p_user_id, p_session_id,
    p_primary_product_id, p_primary_product_title, p_primary_product_tags,
    p_source_screen, p_matched_tag,
    p_upsell_products, v_upsell_count,
    p_combo_discount_percent, 'shown'
  )
  RETURNING id INTO v_event_id;

  -- Update tag performance for primary product
  IF p_matched_tag IS NOT NULL THEN
    INSERT INTO crystal_tag_performance (tag, times_shown, times_as_primary)
    VALUES (p_matched_tag, 1, 1)
    ON CONFLICT (tag) DO UPDATE SET
      times_shown = crystal_tag_performance.times_shown + 1,
      times_as_primary = crystal_tag_performance.times_as_primary + 1,
      updated_at = NOW();
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: Track upsell conversion (when user adds upsell products)
CREATE OR REPLACE FUNCTION track_upsell_conversion(
  p_event_id UUID,
  p_products_added JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conversion_count INT;
BEGIN
  v_conversion_count := jsonb_array_length(COALESCE(p_products_added, '[]'::jsonb));

  UPDATE upsell_events SET
    products_added = p_products_added,
    conversion_count = v_conversion_count,
    status = CASE WHEN v_conversion_count > 0 THEN 'converted' ELSE 'skipped' END,
    converted_at = CASE WHEN v_conversion_count > 0 THEN NOW() ELSE NULL END
  WHERE id = p_event_id;

  -- Update tag performance for converted products
  IF v_conversion_count > 0 THEN
    -- This would need to extract tags from products_added
    -- Simplified: just mark as converted
    NULL;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: Track combo purchase completion
CREATE OR REPLACE FUNCTION track_combo_purchase(
  p_user_id UUID,
  p_shopify_order_id TEXT,
  p_order_number TEXT,
  p_products JSONB,
  p_subtotal DECIMAL,
  p_discount_percent DECIMAL,
  p_discount_amount DECIMAL,
  p_total DECIMAL,
  p_upsell_event_id UUID DEFAULT NULL,
  p_source_screen TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_item_count INT;
BEGIN
  v_item_count := jsonb_array_length(COALESCE(p_products, '[]'::jsonb));

  -- Insert combo purchase
  INSERT INTO combo_purchases (
    user_id, shopify_order_id, order_number,
    item_count, products,
    subtotal, discount_percent, discount_amount, total,
    upsell_event_id, source_screen
  ) VALUES (
    p_user_id, p_shopify_order_id, p_order_number,
    v_item_count, p_products,
    p_subtotal, p_discount_percent, p_discount_amount, p_total,
    p_upsell_event_id, p_source_screen
  )
  RETURNING id INTO v_purchase_id;

  -- Update upsell event if linked
  IF p_upsell_event_id IS NOT NULL THEN
    UPDATE upsell_events SET
      status = 'checkout',
      checkout_at = NOW()
    WHERE id = p_upsell_event_id;
  END IF;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Get upsell analytics summary (for admin)
CREATE OR REPLACE FUNCTION get_upsell_analytics(
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  total_shown BIGINT,
  total_converted BIGINT,
  total_checkout BIGINT,
  conversion_rate DECIMAL,
  checkout_rate DECIMAL,
  avg_upsells_shown DECIMAL,
  avg_upsells_added DECIMAL,
  total_combo_revenue DECIMAL,
  avg_discount_percent DECIMAL,
  top_source_screen TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_shown,
    COUNT(*) FILTER (WHERE status IN ('converted', 'checkout'))::BIGINT as total_converted,
    COUNT(*) FILTER (WHERE status = 'checkout')::BIGINT as total_checkout,
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('converted', 'checkout'))::DECIMAL /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as conversion_rate,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'checkout')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as checkout_rate,
    ROUND(AVG(upsell_count)::DECIMAL, 1) as avg_upsells_shown,
    ROUND(AVG(conversion_count)::DECIMAL, 1) as avg_upsells_added,
    COALESCE(
      (SELECT SUM(total) FROM combo_purchases WHERE created_at > NOW() - (p_days || ' days')::INTERVAL),
      0
    ) as total_combo_revenue,
    ROUND(AVG(combo_discount_percent)::DECIMAL, 1) as avg_discount_percent,
    (SELECT source_screen FROM upsell_events
     WHERE shown_at > NOW() - (p_days || ' days')::INTERVAL
     GROUP BY source_screen
     ORDER BY COUNT(*) DESC
     LIMIT 1) as top_source_screen
  FROM upsell_events
  WHERE shown_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Seed initial tag performance data
INSERT INTO crystal_tag_performance (tag) VALUES
  ('Thạch Anh Hồng'),
  ('Thạch Anh Tím'),
  ('Thạch Anh Vàng'),
  ('Thạch Anh Trắng'),
  ('Cây Tài Lộc'),
  ('Khói Xám'),
  ('Hematite'),
  ('Vòng Tay'),
  ('Trụ'),
  ('Cụm'),
  ('Set'),
  ('Special set'),
  ('Tinh dầu nước hoa Jérie'),
  ('Bestseller')
ON CONFLICT (tag) DO NOTHING;

-- Done
SELECT 'Crystal Upsell Analytics migration complete!' as result;
