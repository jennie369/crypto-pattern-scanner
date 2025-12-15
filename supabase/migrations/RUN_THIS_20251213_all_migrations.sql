-- =====================================================
-- ALL MIGRATIONS FOR 2025-12-13
-- Run this file once in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: FIX is_seed_post TRIGGER ERROR
-- =====================================================

DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN
    SELECT tgname, pg_get_triggerdef(t.oid) as def
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'forum_posts'
      AND NOT t.tgisinternal
  LOOP
    IF trigger_rec.def ILIKE '%is_seed_post%' THEN
      RAISE NOTICE 'Dropping trigger % because it references is_seed_post', trigger_rec.tgname;
      EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON forum_posts';
    END IF;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS check_is_seed_post() CASCADE;
DROP FUNCTION IF EXISTS validate_seed_post() CASCADE;
DROP FUNCTION IF EXISTS prevent_seed_post_update() CASCADE;

ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_seed_post BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_seed_post ON forum_posts(is_seed_post);

-- =====================================================
-- PART 2: FIX FORUM_COMMENTS TRIGGER (author_id error)
-- =====================================================

DROP TRIGGER IF EXISTS trigger_new_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_notify_comment ON forum_comments;
DROP TRIGGER IF EXISTS trigger_comment_notification ON forum_comments;
DROP TRIGGER IF EXISTS after_comment_insert ON forum_comments;

DROP FUNCTION IF EXISTS notify_new_comment() CASCADE;
DROP FUNCTION IF EXISTS handle_new_comment() CASCADE;
DROP FUNCTION IF EXISTS create_comment_notification() CASCADE;

CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM (SELECT user_id FROM forum_posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, from_user_id, type, title, body, data)
    SELECT
      fp.user_id,
      NEW.user_id,
      'forum_comment',
      'Bình luận mới',
      (SELECT COALESCE(full_name, 'Ai đó') FROM profiles WHERE id = NEW.user_id) || ' đã bình luận bài viết của bạn',
      jsonb_build_object(
        'postId', NEW.post_id,
        'commentId', NEW.id
      )
    FROM forum_posts fp
    WHERE fp.id = NEW.post_id
      AND fp.user_id IS NOT NULL;
  END IF;

  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, from_user_id, type, title, body, data)
    SELECT
      fc.user_id,
      NEW.user_id,
      'forum_reply',
      'Trả lời bình luận',
      (SELECT COALESCE(full_name, 'Ai đó') FROM profiles WHERE id = NEW.user_id) || ' đã trả lời bình luận của bạn',
      jsonb_build_object(
        'postId', NEW.post_id,
        'commentId', NEW.id,
        'parentCommentId', NEW.parent_id
      )
    FROM forum_comments fc
    WHERE fc.id = NEW.parent_id
      AND fc.user_id IS NOT NULL
      AND fc.user_id IS DISTINCT FROM NEW.user_id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Comment notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created ON forum_comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_created();

-- =====================================================
-- PART 3: FIX SHOPIFY_ORDERS SCHEMA FOR ORDER TRACKING
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN order_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'subtotal_price'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN subtotal_price DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'total_discounts'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN total_discounts DECIMAL(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'line_items'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN line_items JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN shipping_address JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN tracking_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'tracking_url'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN tracking_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN carrier TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'fulfilled_at'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN fulfilled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shopify_orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE shopify_orders ADD COLUMN customer_email TEXT;
  END IF;
END $$;

-- Add linked_emails to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linked_emails'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linked_emails TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopify_orders_email ON shopify_orders(email);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_order_number ON shopify_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_financial_status ON shopify_orders(financial_status);

-- RLS
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own orders" ON shopify_orders;
DROP POLICY IF EXISTS "Users view orders by email" ON shopify_orders;
DROP POLICY IF EXISTS "Users view linked email orders" ON shopify_orders;
DROP POLICY IF EXISTS "Service role full access" ON shopify_orders;
DROP POLICY IF EXISTS "Users can link orders" ON shopify_orders;

CREATE POLICY "Users view own orders" ON shopify_orders
FOR SELECT USING (
  auth.uid() = user_id
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR email = ANY(
    SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can link orders" ON shopify_orders
FOR UPDATE USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR email = ANY(
    SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
  )
) WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Service role full access" ON shopify_orders
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Sync email trigger
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

-- =====================================================
-- PART 4: CRYSTAL UPSELL ANALYTICS & COMBO TRACKING
-- =====================================================

-- Upsell Events Table
CREATE TABLE IF NOT EXISTS upsell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  primary_product_id TEXT NOT NULL,
  primary_product_title TEXT,
  primary_product_tags TEXT[],
  source_screen TEXT,
  matched_tag TEXT,
  upsell_products JSONB DEFAULT '[]'::jsonb,
  upsell_count INT DEFAULT 0,
  products_added JSONB DEFAULT '[]'::jsonb,
  conversion_count INT DEFAULT 0,
  combo_discount_percent DECIMAL(5,2) DEFAULT 0,
  potential_savings DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'shown',
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  checkout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combo Purchases Table
CREATE TABLE IF NOT EXISTS combo_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shopify_order_id TEXT,
  order_number TEXT,
  item_count INT NOT NULL,
  products JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  upsell_event_id UUID REFERENCES upsell_events(id) ON DELETE SET NULL,
  source_screen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crystal Tag Performance
CREATE TABLE IF NOT EXISTS crystal_tag_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,
  times_shown INT DEFAULT 0,
  times_as_primary INT DEFAULT 0,
  times_as_upsell INT DEFAULT 0,
  times_added_to_cart INT DEFAULT 0,
  times_purchased INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_upsell_events_user ON upsell_events(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_events_status ON upsell_events(status);
CREATE INDEX IF NOT EXISTS idx_upsell_events_source ON upsell_events(source_screen);
CREATE INDEX IF NOT EXISTS idx_upsell_events_shown_at ON upsell_events(shown_at);
CREATE INDEX IF NOT EXISTS idx_combo_purchases_user ON combo_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_combo_purchases_order ON combo_purchases(shopify_order_id);

-- RLS
ALTER TABLE upsell_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_tag_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own upsell events" ON upsell_events;
DROP POLICY IF EXISTS "Users insert own upsell events" ON upsell_events;
DROP POLICY IF EXISTS "Users update own upsell events" ON upsell_events;
DROP POLICY IF EXISTS "Users view own combo purchases" ON combo_purchases;
DROP POLICY IF EXISTS "Service role upsell events" ON upsell_events;
DROP POLICY IF EXISTS "Service role combo purchases" ON combo_purchases;
DROP POLICY IF EXISTS "Anyone can view tag performance" ON crystal_tag_performance;
DROP POLICY IF EXISTS "Service role tag performance" ON crystal_tag_performance;

CREATE POLICY "Users view own upsell events" ON upsell_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own upsell events" ON upsell_events
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own upsell events" ON upsell_events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own combo purchases" ON combo_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role upsell events" ON upsell_events
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role combo purchases" ON combo_purchases
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Anyone can view tag performance" ON crystal_tag_performance
FOR SELECT USING (true);

CREATE POLICY "Service role tag performance" ON crystal_tag_performance
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RPC: Track upsell shown event
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
  v_upsell_count := jsonb_array_length(COALESCE(p_upsell_products, '[]'::jsonb));

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

-- RPC: Track upsell conversion
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

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Track combo purchase
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

  IF p_upsell_event_id IS NOT NULL THEN
    UPDATE upsell_events SET
      status = 'checkout',
      checkout_at = NOW()
    WHERE id = p_upsell_event_id;
  END IF;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get upsell analytics
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
    COUNT(*) FILTER (WHERE ue.status IN ('converted', 'checkout'))::BIGINT as total_converted,
    COUNT(*) FILTER (WHERE ue.status = 'checkout')::BIGINT as total_checkout,
    ROUND(
      COUNT(*) FILTER (WHERE ue.status IN ('converted', 'checkout'))::DECIMAL /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as conversion_rate,
    ROUND(
      COUNT(*) FILTER (WHERE ue.status = 'checkout')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as checkout_rate,
    ROUND(AVG(ue.upsell_count)::DECIMAL, 1) as avg_upsells_shown,
    ROUND(AVG(ue.conversion_count)::DECIMAL, 1) as avg_upsells_added,
    COALESCE(
      (SELECT SUM(cp.total) FROM combo_purchases cp WHERE cp.created_at > NOW() - (p_days || ' days')::INTERVAL),
      0
    ) as total_combo_revenue,
    ROUND(AVG(ue.combo_discount_percent)::DECIMAL, 1) as avg_discount_percent,
    (SELECT ue2.source_screen FROM upsell_events ue2
     WHERE ue2.shown_at > NOW() - (p_days || ' days')::INTERVAL
     GROUP BY ue2.source_screen
     ORDER BY COUNT(*) DESC
     LIMIT 1) as top_source_screen
  FROM upsell_events ue
  WHERE ue.shown_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed tag performance
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

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ALL MIGRATIONS COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created/updated:';
  RAISE NOTICE '  - forum_posts (is_seed_post column)';
  RAISE NOTICE '  - forum_comments (trigger fixed)';
  RAISE NOTICE '  - shopify_orders (order tracking columns)';
  RAISE NOTICE '  - profiles (linked_emails)';
  RAISE NOTICE '  - upsell_events (NEW)';
  RAISE NOTICE '  - combo_purchases (NEW)';
  RAISE NOTICE '  - crystal_tag_performance (NEW)';
  RAISE NOTICE '';
  RAISE NOTICE 'RPC Functions:';
  RAISE NOTICE '  - track_upsell_shown()';
  RAISE NOTICE '  - track_upsell_conversion()';
  RAISE NOTICE '  - track_combo_purchase()';
  RAISE NOTICE '  - get_upsell_analytics()';
  RAISE NOTICE '========================================';
END $$;

SELECT 'All 2025-12-13 migrations completed successfully!' as result;
