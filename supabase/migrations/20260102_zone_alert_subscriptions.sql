-- =====================================================
-- ZONE ALERT SUBSCRIPTIONS & NOTIFICATIONS
-- Created: 2026-01-02
-- Description: Real-time zone alert subscriptions and notification logging
-- =====================================================

-- =====================================================
-- 1. ZONE ALERT SUBSCRIPTIONS
-- Stores user subscriptions for real-time zone alerts
-- Used by zonePriceMonitor for WebSocket monitoring
-- =====================================================
CREATE TABLE IF NOT EXISTS zone_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zone reference
  zone_id UUID REFERENCES detected_zones(id) ON DELETE CASCADE,

  -- Zone data (cached for quick access even if zone is deleted)
  symbol VARCHAR(20) NOT NULL,
  zone_type VARCHAR(10) NOT NULL,              -- 'HFZ' or 'LFZ'
  zone_high DECIMAL(20, 8) NOT NULL,           -- Top of zone
  zone_low DECIMAL(20, 8) NOT NULL,            -- Bottom of zone

  -- Alert configuration
  alert_types TEXT[] DEFAULT ARRAY['retest', 'broken'],  -- Array of: 'retest', 'broken', 'approaching'

  -- Status
  active BOOLEAN DEFAULT TRUE,
  triggered_count INT DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_zone_type_sub CHECK (zone_type IN ('HFZ', 'LFZ')),
  CONSTRAINT valid_zone_boundaries_sub CHECK (zone_high > zone_low)
);

-- =====================================================
-- 2. ZONE NOTIFICATIONS LOG
-- Records all sent notifications for analytics & deduplication
-- =====================================================
CREATE TABLE IF NOT EXISTS zone_notifications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification details
  notification_type VARCHAR(30) NOT NULL,      -- 'zone_retest', 'zone_broken', etc.
  symbol VARCHAR(20) NOT NULL,
  zone_id UUID REFERENCES detected_zones(id) ON DELETE SET NULL,

  -- Notification data (JSON)
  data JSONB DEFAULT '{}'::jsonb,

  -- Status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_notification_type CHECK (notification_type IN (
    'zone_retest',
    'zone_broken',
    'fresh_zone_detected',
    'mtf_alignment',
    'approaching_zone'
  ))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_alert_subs_user ON zone_alert_subscriptions(user_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_subs_symbol ON zone_alert_subscriptions(symbol) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_subs_zone ON zone_alert_subscriptions(zone_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_subs_user_symbol ON zone_alert_subscriptions(user_id, symbol) WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_notif_log_user ON zone_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_sent ON zone_notifications_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_type ON zone_notifications_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notif_log_symbol ON zone_notifications_log(symbol);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE zone_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_notifications_log ENABLE ROW LEVEL SECURITY;

-- RLS for zone_alert_subscriptions
DROP POLICY IF EXISTS "Users can manage own alert subscriptions" ON zone_alert_subscriptions;
CREATE POLICY "Users can manage own alert subscriptions" ON zone_alert_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS for zone_notifications_log
DROP POLICY IF EXISTS "Users can view own notifications" ON zone_notifications_log;
CREATE POLICY "Users can view own notifications" ON zone_notifications_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON zone_notifications_log;
CREATE POLICY "Users can insert own notifications" ON zone_notifications_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
DROP POLICY IF EXISTS "Admins can manage all alert subscriptions" ON zone_alert_subscriptions;
CREATE POLICY "Admins can manage all alert subscriptions" ON zone_alert_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can view all notifications" ON zone_notifications_log;
CREATE POLICY "Admins can view all notifications" ON zone_notifications_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Get user's active alert count
CREATE OR REPLACE FUNCTION get_user_alert_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  alert_count INT;
BEGIN
  SELECT COUNT(*) INTO alert_count
  FROM zone_alert_subscriptions
  WHERE user_id = p_user_id
    AND active = TRUE;

  RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get max alerts based on user tier
CREATE OR REPLACE FUNCTION get_user_max_alerts(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  user_tier TEXT;
  max_alerts INT;
BEGIN
  SELECT scanner_tier INTO user_tier
  FROM profiles
  WHERE id = p_user_id;

  CASE user_tier
    WHEN 'TIER3' THEN max_alerts := -1;    -- Unlimited
    WHEN 'TIER2' THEN max_alerts := 10;
    WHEN 'TIER1' THEN max_alerts := 3;
    WHEN 'ADMIN' THEN max_alerts := -1;    -- Unlimited
    ELSE max_alerts := 0;                   -- FREE: no alerts
  END CASE;

  RETURN max_alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can add more alerts
CREATE OR REPLACE FUNCTION can_add_alert(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INT;
  max_allowed INT;
BEGIN
  current_count := get_user_alert_count(p_user_id);
  max_allowed := get_user_max_alerts(p_user_id);

  -- -1 means unlimited
  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update subscription triggered stats
CREATE OR REPLACE FUNCTION update_subscription_triggered()
RETURNS TRIGGER AS $$
BEGIN
  -- Update subscription when notification is logged
  IF NEW.zone_id IS NOT NULL THEN
    UPDATE zone_alert_subscriptions
    SET
      triggered_count = triggered_count + 1,
      last_triggered_at = NOW(),
      updated_at = NOW()
    WHERE zone_id = NEW.zone_id
      AND user_id = NEW.user_id
      AND active = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update subscription on notification
DROP TRIGGER IF EXISTS trigger_update_subscription_triggered ON zone_notifications_log;
CREATE TRIGGER trigger_update_subscription_triggered
  AFTER INSERT ON zone_notifications_log
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_triggered();

-- Function: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_alert_sub_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on zone_alert_subscriptions
DROP TRIGGER IF EXISTS trigger_alert_sub_updated_at ON zone_alert_subscriptions;
CREATE TRIGGER trigger_alert_sub_updated_at
  BEFORE UPDATE ON zone_alert_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_sub_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON zone_alert_subscriptions TO authenticated;
GRANT ALL ON zone_notifications_log TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_alert_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_max_alerts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_add_alert(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE zone_alert_subscriptions IS 'User subscriptions for real-time zone alerts. Used by zonePriceMonitor WebSocket service.';
COMMENT ON TABLE zone_notifications_log IS 'Log of all sent zone notifications for analytics and deduplication.';

COMMENT ON COLUMN zone_alert_subscriptions.alert_types IS 'Array of alert types: retest, broken, approaching';
COMMENT ON COLUMN zone_alert_subscriptions.triggered_count IS 'Number of times this subscription has triggered notifications';

COMMENT ON COLUMN zone_notifications_log.notification_type IS 'Type: zone_retest, zone_broken, fresh_zone_detected, mtf_alignment, approaching_zone';
COMMENT ON COLUMN zone_notifications_log.data IS 'JSON data containing notification details (price, zone info, etc.)';
