-- ============================================================================
-- FILE: supabase/migrations/20260111_digital_product_views.sql
-- Digital Products Analytics - Views, Clicks, Notifications Tracking
-- ============================================================================

-- ============================================================================
-- TABLE: digital_product_views
-- Track when users view digital products
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shopify_product_id TEXT NOT NULL,
  product_type TEXT NOT NULL, -- 'course', 'chatbot', 'scanner', 'gems', 'spiritual-course'
  tier TEXT, -- 'starter', 'tier1', 'tier2', 'tier3'
  view_source TEXT DEFAULT 'shop_tab', -- 'shop_tab', 'hero', 'search', 'recommendation', 'notification'
  session_id TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_digital_views_user ON digital_product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_views_product ON digital_product_views(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_digital_views_type ON digital_product_views(product_type);
CREATE INDEX IF NOT EXISTS idx_digital_views_created ON digital_product_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_views_source ON digital_product_views(view_source);

-- ============================================================================
-- TABLE: digital_product_clicks
-- Track CTA interactions (view detail, add cart, buy now)
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_product_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shopify_product_id TEXT NOT NULL,
  click_type TEXT NOT NULL, -- 'view_detail', 'add_cart', 'buy_now', 'hero_slide', 'upgrade_prompt'
  tier_required TEXT,
  user_tier TEXT,
  converted BOOLEAN DEFAULT false,
  conversion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digital_clicks_user ON digital_product_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_clicks_product ON digital_product_clicks(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_digital_clicks_type ON digital_product_clicks(click_type);
CREATE INDEX IF NOT EXISTS idx_digital_clicks_created ON digital_product_clicks(created_at DESC);

-- ============================================================================
-- TABLE: digital_promo_notifications
-- Track push notifications sent for digital products
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_promo_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'new_course', 'sale', 'tier_upgrade', 'reminder', 'flash_sale'
  product_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_date DATE DEFAULT CURRENT_DATE, -- Date for daily uniqueness constraint
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_notif_user ON digital_promo_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_notif_sent ON digital_promo_notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_promo_notif_type ON digital_promo_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_promo_notif_unread ON digital_promo_notifications(user_id) WHERE read_at IS NULL;

-- Unique index to prevent duplicate notifications on same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_notif_daily_unique
  ON digital_promo_notifications(user_id, notification_type, COALESCE(product_id, ''), sent_date);

-- ============================================================================
-- TABLE: digital_notification_preferences
-- User preferences for digital product notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  new_courses BOOLEAN DEFAULT true,
  sales BOOLEAN DEFAULT true,
  tier_updates BOOLEAN DEFAULT true,
  flash_sales BOOLEAN DEFAULT true,
  cart_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON digital_notification_preferences(user_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE digital_product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_promo_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Views: Users can insert their own (or anonymous), admins can read all
CREATE POLICY "Users can insert own views" ON digital_product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own views" ON digital_product_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all views" ON digital_product_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Clicks: Users can insert their own (or anonymous)
CREATE POLICY "Users can insert own clicks" ON digital_product_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own clicks" ON digital_product_clicks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all clicks" ON digital_product_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Notifications: Users can read/update their own
CREATE POLICY "Users can read own notifications" ON digital_promo_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON digital_promo_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON digital_promo_notifications
  FOR INSERT WITH CHECK (true);

-- Preferences: Users can manage their own
CREATE POLICY "Users can manage own preferences" ON digital_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Track product view
CREATE OR REPLACE FUNCTION track_digital_product_view(
  p_user_id UUID,
  p_product_id TEXT,
  p_product_type TEXT,
  p_tier TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'shop_tab'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_view_id UUID;
BEGIN
  INSERT INTO digital_product_views (user_id, shopify_product_id, product_type, tier, view_source)
  VALUES (p_user_id, p_product_id, p_product_type, p_tier, p_source)
  RETURNING id INTO v_view_id;

  RETURN v_view_id;
END;
$$;

-- Function: Track product click
CREATE OR REPLACE FUNCTION track_digital_product_click(
  p_user_id UUID,
  p_product_id TEXT,
  p_click_type TEXT,
  p_tier_required TEXT DEFAULT NULL,
  p_user_tier TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_click_id UUID;
BEGIN
  INSERT INTO digital_product_clicks (user_id, shopify_product_id, click_type, tier_required, user_tier)
  VALUES (p_user_id, p_product_id, p_click_type, p_tier_required, p_user_tier)
  RETURNING id INTO v_click_id;

  RETURN v_click_id;
END;
$$;

-- Function: Get popular digital products (for analytics)
CREATE OR REPLACE FUNCTION get_popular_digital_products(
  p_product_type TEXT DEFAULT NULL,
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  shopify_product_id TEXT,
  view_count BIGINT,
  click_count BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.shopify_product_id,
    COUNT(DISTINCT v.id) as view_count,
    COALESCE(COUNT(DISTINCT c.id), 0) as click_count,
    CASE
      WHEN COUNT(DISTINCT v.id) > 0
      THEN ROUND(COALESCE(COUNT(DISTINCT c.id), 0)::NUMERIC / COUNT(DISTINCT v.id) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM digital_product_views v
  LEFT JOIN digital_product_clicks c ON v.shopify_product_id = c.shopify_product_id
    AND c.created_at >= NOW() - (p_days || ' days')::INTERVAL
  WHERE v.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_product_type IS NULL OR v.product_type = p_product_type)
  GROUP BY v.shopify_product_id
  ORDER BY view_count DESC
  LIMIT p_limit;
END;
$$;

-- Function: Mark click as converted
CREATE OR REPLACE FUNCTION mark_click_converted(
  p_click_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE digital_product_clicks
  SET converted = true, conversion_at = NOW()
  WHERE id = p_click_id;

  RETURN FOUND;
END;
$$;

-- Function: Get user notification preferences (with defaults)
CREATE OR REPLACE FUNCTION get_notification_preferences(
  p_user_id UUID
)
RETURNS digital_notification_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs digital_notification_preferences;
BEGIN
  SELECT * INTO v_prefs
  FROM digital_notification_preferences
  WHERE user_id = p_user_id;

  -- If no preferences exist, create defaults
  IF NOT FOUND THEN
    INSERT INTO digital_notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;

-- ============================================================================
-- UPDATE DATABASE_SCHEMA.md AFTER RUNNING THIS MIGRATION
-- ============================================================================
