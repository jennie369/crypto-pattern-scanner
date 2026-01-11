-- =====================================================
-- ALL MISSING TABLES AND RPC FUNCTIONS
-- Run this in Supabase Dashboard > SQL Editor
-- Created: 2024-12-29
-- =====================================================

-- =====================================================
-- 1. COURSE HIGHLIGHTS (Featured courses)
-- =====================================================
CREATE TABLE IF NOT EXISTS course_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR(50) DEFAULT 'Nổi bật',
  badge_color VARCHAR(20) DEFAULT 'gold',
  cta_text VARCHAR(50) DEFAULT 'Xem chi tiết',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_price BOOLEAN DEFAULT true,
  show_students BOOLEAN DEFAULT true,
  show_rating BOOLEAN DEFAULT true,
  show_lessons BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_highlights_active ON course_highlights(is_active, display_order);

ALTER TABLE course_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active course highlights" ON course_highlights;
CREATE POLICY "Anyone can view active course highlights" ON course_highlights
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage course highlights" ON course_highlights;
CREATE POLICY "Admins can manage course highlights" ON course_highlights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin')))
  );

GRANT SELECT ON course_highlights TO anon;
GRANT ALL ON course_highlights TO authenticated;

-- =====================================================
-- 2. SHOP BANNERS
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  link_type TEXT DEFAULT 'none',
  link_value TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  background_color TEXT DEFAULT '#1a0b2e',
  text_color TEXT DEFAULT '#FFFFFF',
  created_by UUID REFERENCES profiles(id),
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_banners_active ON shop_banners(is_active, display_order);

ALTER TABLE shop_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active shop banners" ON shop_banners;
CREATE POLICY "Anyone can view active shop banners" ON shop_banners
  FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

DROP POLICY IF EXISTS "Admins can manage shop banners" ON shop_banners;
CREATE POLICY "Admins can manage shop banners" ON shop_banners
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON shop_banners TO anon;
GRANT ALL ON shop_banners TO authenticated;

-- =====================================================
-- 3. PROMO BANNERS (Hero carousel)
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  bg_color VARCHAR(20) DEFAULT '#1A1B3A',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  cta_text VARCHAR(50) DEFAULT 'Xem ngay',
  cta_color VARCHAR(20) DEFAULT '#FFBD59',
  action_type VARCHAR(20) DEFAULT 'none',
  action_value TEXT,
  target_tier VARCHAR(20),
  target_screens TEXT[] DEFAULT '{courses}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON promo_banners(is_active, sort_order);

ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active promo banners" ON promo_banners;
CREATE POLICY "Anyone can view active promo banners" ON promo_banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage promo banners" ON promo_banners;
CREATE POLICY "Admins can manage promo banners" ON promo_banners
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON promo_banners TO anon;
GRANT ALL ON promo_banners TO authenticated;

-- =====================================================
-- 4. PROMO BAR CONFIG
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_bar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  voucher_code VARCHAR(50),
  link_text VARCHAR(100),
  link_url TEXT,
  background_color VARCHAR(20) DEFAULT '#9C0612',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  target_screens TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_bar_config_active ON promo_bar_config(is_active, display_order);

ALTER TABLE promo_bar_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active promo bar" ON promo_bar_config;
CREATE POLICY "Anyone can view active promo bar" ON promo_bar_config FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage promo bar" ON promo_bar_config;
CREATE POLICY "Admins can manage promo bar" ON promo_bar_config
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON promo_bar_config TO anon;
GRANT ALL ON promo_bar_config TO authenticated;

-- =====================================================
-- 5. FEATURED PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price DECIMAL(15, 2),
  original_price DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'VND',
  image_url TEXT,
  badge_text VARCHAR(50),
  badge_color VARCHAR(20) DEFAULT '#FF4757',
  background_gradient_start VARCHAR(20) DEFAULT '#1a0b2e',
  background_gradient_end VARCHAR(20) DEFAULT '#2d1b4e',
  accent_color VARCHAR(20) DEFAULT '#FFD700',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  link_type TEXT DEFAULT 'collection',
  link_value TEXT,
  cta_text VARCHAR(50) DEFAULT 'Xem ngay',
  layout_style VARCHAR(20) DEFAULT 'card',
  show_price BOOLEAN DEFAULT true,
  show_badge BOOLEAN DEFAULT true,
  show_description BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_products_active ON featured_products(is_active, display_order);

ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active featured products" ON featured_products;
CREATE POLICY "Anyone can view active featured products" ON featured_products
  FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

DROP POLICY IF EXISTS "Admins can manage featured products" ON featured_products;
CREATE POLICY "Admins can manage featured products" ON featured_products
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON featured_products TO anon;
GRANT ALL ON featured_products TO authenticated;

-- =====================================================
-- 6. FLASH SALE CONFIG
-- =====================================================
CREATE TABLE IF NOT EXISTS flash_sale_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Flash Sale',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  product_ids TEXT[] DEFAULT '{}',
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_sale_active ON flash_sale_config(is_active);

ALTER TABLE flash_sale_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active flash sales" ON flash_sale_config;
CREATE POLICY "Anyone can view active flash sales" ON flash_sale_config
  FOR SELECT USING (is_active = true AND start_time <= NOW() AND end_time >= NOW());

DROP POLICY IF EXISTS "Admins can manage flash sales" ON flash_sale_config;
CREATE POLICY "Admins can manage flash sales" ON flash_sale_config
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON flash_sale_config TO anon;
GRANT ALL ON flash_sale_config TO authenticated;

-- =====================================================
-- 7. COURSE FLASH SALES
-- =====================================================
CREATE TABLE IF NOT EXISTS course_flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'Flash Sale',
  subtitle TEXT,
  course_ids UUID[] NOT NULL DEFAULT '{}',
  discount_percentage INTEGER NOT NULL DEFAULT 30,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_color VARCHAR(20) DEFAULT '#9C0612',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_flash_sales_active ON course_flash_sales(is_active, start_time, end_time);

ALTER TABLE course_flash_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active course flash sales" ON course_flash_sales;
CREATE POLICY "Anyone can view active course flash sales" ON course_flash_sales FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage course flash sales" ON course_flash_sales;
CREATE POLICY "Admins can manage course flash sales" ON course_flash_sales
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON course_flash_sales TO anon;
GRANT ALL ON course_flash_sales TO authenticated;

-- =====================================================
-- 8. LIVESTREAM TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS livestream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended'
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  max_viewers INTEGER DEFAULT 0,
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livestream_sessions_status ON livestream_sessions(status);
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_host ON livestream_sessions(host_id);

ALTER TABLE livestream_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view livestream sessions" ON livestream_sessions;
CREATE POLICY "Anyone can view livestream sessions" ON livestream_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own livestreams" ON livestream_sessions;
CREATE POLICY "Users can manage own livestreams" ON livestream_sessions
  FOR ALL USING (auth.uid() = host_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role IN ('admin', 'super_admin'))));

GRANT SELECT ON livestream_sessions TO anon;
GRANT ALL ON livestream_sessions TO authenticated;

CREATE TABLE IF NOT EXISTS livestream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livestream_comments_session ON livestream_comments(session_id, created_at DESC);

ALTER TABLE livestream_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view livestream comments" ON livestream_comments;
CREATE POLICY "Anyone can view livestream comments" ON livestream_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON livestream_comments;
CREATE POLICY "Users can insert own comments" ON livestream_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON livestream_comments TO anon;
GRANT ALL ON livestream_comments TO authenticated;

CREATE TABLE IF NOT EXISTS livestream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gift_type VARCHAR(50) NOT NULL,
  amount INTEGER DEFAULT 1,
  gem_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livestream_gifts_session ON livestream_gifts(session_id);

ALTER TABLE livestream_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view livestream gifts" ON livestream_gifts;
CREATE POLICY "Anyone can view livestream gifts" ON livestream_gifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can send gifts" ON livestream_gifts;
CREATE POLICY "Users can send gifts" ON livestream_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

GRANT SELECT ON livestream_gifts TO anon;
GRANT ALL ON livestream_gifts TO authenticated;

-- =====================================================
-- 9. USER PREFERENCES TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tarot_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  selected_deck VARCHAR(50) DEFAULT 'classic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_tarot_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tarot preferences" ON user_tarot_preferences;
CREATE POLICY "Users can manage own tarot preferences" ON user_tarot_preferences
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON user_tarot_preferences TO authenticated;

CREATE TABLE IF NOT EXISTS user_timeframe_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  selected_timeframes TEXT[] DEFAULT '{15m,1h,4h}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_timeframe_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own timeframe preferences" ON user_timeframe_preferences;
CREATE POLICY "Users can manage own timeframe preferences" ON user_timeframe_preferences
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON user_timeframe_preferences TO authenticated;

CREATE TABLE IF NOT EXISTS user_chart_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  chart_type VARCHAR(20) DEFAULT 'candle',
  show_volume BOOLEAN DEFAULT true,
  show_grid BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'dark',
  indicators JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_chart_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chart preferences" ON user_chart_preferences;
CREATE POLICY "Users can manage own chart preferences" ON user_chart_preferences
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON user_chart_preferences TO authenticated;

-- =====================================================
-- 10. CALENDAR EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  reminder_at TIMESTAMPTZ,
  color VARCHAR(20) DEFAULT '#FFBD59',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events(user_id, start_time);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own calendar events" ON calendar_events;
CREATE POLICY "Users can manage own calendar events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON calendar_events TO authenticated;

-- =====================================================
-- 11. VISION BOARD ARCHIVED COLUMNS
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vision_board_widgets' AND column_name = 'archived') THEN
    ALTER TABLE vision_board_widgets ADD COLUMN archived BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vision_board_widgets' AND column_name = 'archived_at') THEN
    ALTER TABLE vision_board_widgets ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_archived ON vision_board_widgets(user_id, archived) WHERE archived = TRUE;

-- =====================================================
-- 12. ADMIN LOGS & TOOLTIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_banner_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID,
  banner_type VARCHAR(50),
  action TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_banner_logs_created ON admin_banner_logs(created_at DESC);

ALTER TABLE admin_banner_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can view banner logs" ON admin_banner_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))));

DROP POLICY IF EXISTS "Admins can insert banner logs" ON admin_banner_logs;
CREATE POLICY "Admins can insert banner logs" ON admin_banner_logs
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))));

GRANT ALL ON admin_banner_logs TO authenticated;

CREATE TABLE IF NOT EXISTS admin_tooltips_seen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tooltip_key TEXT NOT NULL,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooltip_key)
);

ALTER TABLE admin_tooltips_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tooltips" ON admin_tooltips_seen;
CREATE POLICY "Users can manage own tooltips" ON admin_tooltips_seen FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON admin_tooltips_seen TO authenticated;

-- =====================================================
-- 13. BETA FEEDBACK
-- =====================================================
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  feedback_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  title TEXT,
  description TEXT,
  screenshot_url TEXT,
  device_info JSONB,
  app_version VARCHAR(20),
  status VARCHAR(20) DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status, created_at DESC);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own feedback" ON beta_feedback;
CREATE POLICY "Users can manage own feedback" ON beta_feedback
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))));

GRANT ALL ON beta_feedback TO authenticated;

-- =====================================================
-- 14. POST BOOSTS
-- =====================================================
CREATE TABLE IF NOT EXISTS post_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type VARCHAR(20) DEFAULT 'standard',
  gem_spent INTEGER DEFAULT 0,
  duration_hours INTEGER DEFAULT 24,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_boosts_active ON post_boosts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_post_boosts_post ON post_boosts(post_id);

ALTER TABLE post_boosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own boosts" ON post_boosts;
CREATE POLICY "Users can manage own boosts" ON post_boosts
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))));

GRANT ALL ON post_boosts TO authenticated;

-- =====================================================
-- 15. CALL SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  call_type VARCHAR(20) DEFAULT 'audio', -- 'audio', 'video'
  status VARCHAR(20) DEFAULT 'initiating', -- 'initiating', 'ringing', 'active', 'ended', 'missed'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_initiator ON calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calls" ON calls;
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (auth.uid() = initiator_id OR EXISTS (SELECT 1 FROM call_participants WHERE call_id = calls.id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create calls" ON calls;
CREATE POLICY "Users can create calls" ON calls FOR INSERT WITH CHECK (auth.uid() = initiator_id);

DROP POLICY IF EXISTS "Users can update own calls" ON calls;
CREATE POLICY "Users can update own calls" ON calls FOR UPDATE USING (auth.uid() = initiator_id);

GRANT ALL ON calls TO authenticated;

CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'invited', -- 'invited', 'joined', 'left', 'declined'
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_participants_call ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user ON call_participants(user_id);

ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view call participants" ON call_participants;
CREATE POLICY "Users can view call participants" ON call_participants FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM calls WHERE id = call_participants.call_id AND initiator_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage call participants" ON call_participants;
CREATE POLICY "Users can manage call participants" ON call_participants FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON call_participants TO authenticated;

CREATE TABLE IF NOT EXISTS call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_events_call ON call_events(call_id);

ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view call events" ON call_events;
CREATE POLICY "Users can view call events" ON call_events FOR SELECT USING (EXISTS (SELECT 1 FROM call_participants WHERE call_id = call_events.call_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert call events" ON call_events;
CREATE POLICY "Users can insert call events" ON call_events FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT ALL ON call_events TO authenticated;

-- =====================================================
-- 16. USER CART SYNC
-- =====================================================
CREATE TABLE IF NOT EXISTS user_cart_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  cart_data JSONB DEFAULT '[]',
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_cart_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON user_cart_sync;
CREATE POLICY "Users can manage own cart" ON user_cart_sync FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON user_cart_sync TO authenticated;

-- =====================================================
-- 17. RPC FUNCTIONS
-- =====================================================

-- Get highlighted course for course page
CREATE OR REPLACE FUNCTION get_highlighted_course()
RETURNS TABLE (
  id UUID,
  course_id UUID,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_description TEXT,
  custom_image_url TEXT,
  badge_text VARCHAR,
  badge_color VARCHAR,
  cta_text VARCHAR,
  course_title TEXT,
  course_thumbnail TEXT,
  course_price DECIMAL,
  course_is_free BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ch.id,
    ch.course_id,
    ch.custom_title,
    ch.custom_subtitle,
    ch.custom_description,
    ch.custom_image_url,
    ch.badge_text,
    ch.badge_color,
    ch.cta_text,
    c.title as course_title,
    c.thumbnail_url as course_thumbnail,
    c.price as course_price,
    c.is_free as course_is_free
  FROM course_highlights ch
  LEFT JOIN courses c ON c.id = ch.course_id
  WHERE ch.is_active = true
  ORDER BY ch.display_order ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'active_users_week', (SELECT COUNT(*) FROM profiles WHERE last_active_at >= NOW() - INTERVAL '7 days'),
    'pending_applications', (SELECT COUNT(*) FROM partnership_applications WHERE status = 'pending'),
    'pending_withdrawals', (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending'),
    'total_posts', (SELECT COUNT(*) FROM forum_posts),
    'posts_today', (SELECT COUNT(*) FROM forum_posts WHERE created_at >= CURRENT_DATE)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get system health summary
CREATE OR REPLACE FUNCTION get_system_health_summary()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'total_tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'uptime', now() - pg_postmaster_start_time()
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category stats for personalized feed
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
  category TEXT,
  post_count BIGINT,
  engagement_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fp.category,
    COUNT(*)::BIGINT as post_count,
    (COALESCE(SUM(fp.like_count), 0) + COALESCE(SUM(fp.comment_count), 0) * 2)::BIGINT as engagement_score
  FROM forum_posts fp
  WHERE fp.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY fp.category
  ORDER BY engagement_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get ticket stats for support
CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM support_tickets),
    'open', (SELECT COUNT(*) FROM support_tickets WHERE status = 'open'),
    'pending', (SELECT COUNT(*) FROM support_tickets WHERE status = 'pending'),
    'resolved', (SELECT COUNT(*) FROM support_tickets WHERE status = 'resolved'),
    'avg_response_time_hours', (
      SELECT EXTRACT(EPOCH FROM AVG(first_response_at - created_at)) / 3600
      FROM support_tickets WHERE first_response_at IS NOT NULL
    )
  ) INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('total', 0, 'open', 0, 'pending', 0, 'resolved', 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete all seed content (admin only)
CREATE OR REPLACE FUNCTION delete_all_seed_content()
RETURNS JSONB AS $$
DECLARE
  deleted_users INTEGER;
  deleted_posts INTEGER;
  deleted_comments INTEGER;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Delete seed users and their content (cascade)
  DELETE FROM profiles WHERE is_seed_user = true;
  GET DIAGNOSTICS deleted_users = ROW_COUNT;

  -- Delete remaining seed posts
  DELETE FROM forum_posts WHERE is_seed_content = true;
  GET DIAGNOSTICS deleted_posts = ROW_COUNT;

  -- Delete remaining seed comments
  DELETE FROM forum_comments WHERE is_seed_content = true;
  GET DIAGNOSTICS deleted_comments = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_users', deleted_users,
    'deleted_posts', deleted_posts,
    'deleted_comments', deleted_comments
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. GRANT PERMISSIONS TO RPC FUNCTIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_highlighted_course() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_ticket_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_seed_content() TO authenticated;

-- =====================================================
-- DONE! All missing tables and functions created.
-- =====================================================
