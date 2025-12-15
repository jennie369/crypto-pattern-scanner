-- =====================================================
-- SUBSCRIPTION EXPIRATION SYSTEM
-- Created: December 14, 2025
--
-- Features:
-- 1. Auto-revoke expired subscriptions
-- 2. Track expiration logs
-- 3. Get expiring users for admin dashboard
-- 4. Send expiration notifications
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTION EXPIRATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_expiration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was revoked
  tier_type TEXT NOT NULL CHECK (tier_type IN ('chatbot_tier', 'scanner_tier', 'course_tier')),
  old_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL DEFAULT 'FREE',

  -- When it expired
  expired_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NOW(),

  -- How it was processed
  revoke_method TEXT DEFAULT 'auto' CHECK (revoke_method IN ('auto', 'manual', 'scheduled')),

  -- Notification sent?
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expiration_logs_user ON subscription_expiration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_expiration_logs_date ON subscription_expiration_logs(revoked_at DESC);
CREATE INDEX IF NOT EXISTS idx_expiration_logs_tier_type ON subscription_expiration_logs(tier_type);

-- RLS
ALTER TABLE subscription_expiration_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "Admin view expiration logs" ON subscription_expiration_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'super_admin'))
  )
);

-- System can insert logs
CREATE POLICY "System insert expiration logs" ON subscription_expiration_logs
FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. EXPIRATION NOTIFICATIONS TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_expiration_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which subscription
  tier_type TEXT NOT NULL CHECK (tier_type IN ('chatbot_tier', 'scanner_tier', 'course_tier')),
  current_tier TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  expiration_date DATE NOT NULL, -- Separate date column for uniqueness

  -- Notification type
  notification_type TEXT NOT NULL CHECK (notification_type IN ('7_days', '3_days', '1_day', 'expired')),
  days_remaining INT,

  -- Status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  push_sent BOOLEAN DEFAULT FALSE,
  in_app_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,

  -- Prevent duplicates
  UNIQUE(user_id, tier_type, notification_type, expiration_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expiration_notif_user ON subscription_expiration_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_expiration_notif_expires ON subscription_expiration_notifications(expires_at);

-- RLS
ALTER TABLE subscription_expiration_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own expiration notifications" ON subscription_expiration_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System insert expiration notifications" ON subscription_expiration_notifications
FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. CHECK AND REVOKE EXPIRED SUBSCRIPTIONS (RPC)
-- =====================================================
CREATE OR REPLACE FUNCTION check_and_revoke_expired_subscriptions()
RETURNS TABLE (
  user_id UUID,
  tier_type TEXT,
  old_tier TEXT,
  expired_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_count INT := 0;
BEGIN
  -- Find and revoke expired chatbot tiers
  FOR v_record IN
    SELECT
      p.id AS user_id,
      'chatbot_tier' AS tier_type,
      p.chatbot_tier AS old_tier,
      p.chatbot_tier_expires_at AS expired_at
    FROM profiles p
    WHERE p.chatbot_tier IS NOT NULL
      AND p.chatbot_tier != 'FREE'
      AND p.chatbot_tier_expires_at IS NOT NULL
      AND p.chatbot_tier_expires_at < NOW()
  LOOP
    -- Update profile to FREE
    UPDATE profiles
    SET
      chatbot_tier = 'FREE',
      chatbot_tier_expires_at = NULL,
      updated_at = NOW()
    WHERE id = v_record.user_id;

    -- Log the revocation
    INSERT INTO subscription_expiration_logs (
      user_id, tier_type, old_tier, new_tier, expired_at, revoke_method
    ) VALUES (
      v_record.user_id, 'chatbot_tier', v_record.old_tier, 'FREE', v_record.expired_at, 'auto'
    );

    v_count := v_count + 1;

    RETURN NEXT;
  END LOOP;

  -- Find and revoke expired scanner tiers
  FOR v_record IN
    SELECT
      p.id AS user_id,
      'scanner_tier' AS tier_type,
      p.scanner_tier AS old_tier,
      p.scanner_tier_expires_at AS expired_at
    FROM profiles p
    WHERE p.scanner_tier IS NOT NULL
      AND p.scanner_tier != 'FREE'
      AND p.scanner_tier_expires_at IS NOT NULL
      AND p.scanner_tier_expires_at < NOW()
  LOOP
    -- Update profile to FREE
    UPDATE profiles
    SET
      scanner_tier = 'FREE',
      scanner_tier_expires_at = NULL,
      updated_at = NOW()
    WHERE id = v_record.user_id;

    -- Log the revocation
    INSERT INTO subscription_expiration_logs (
      user_id, tier_type, old_tier, new_tier, expired_at, revoke_method
    ) VALUES (
      v_record.user_id, 'scanner_tier', v_record.old_tier, 'FREE', v_record.expired_at, 'auto'
    );

    v_count := v_count + 1;

    RETURN NEXT;
  END LOOP;

  -- Find and revoke expired course tiers
  FOR v_record IN
    SELECT
      p.id AS user_id,
      'course_tier' AS tier_type,
      p.course_tier AS old_tier,
      p.course_tier_expires_at AS expired_at
    FROM profiles p
    WHERE p.course_tier IS NOT NULL
      AND p.course_tier != 'FREE'
      AND p.course_tier_expires_at IS NOT NULL
      AND p.course_tier_expires_at < NOW()
  LOOP
    -- Update profile to FREE
    UPDATE profiles
    SET
      course_tier = 'FREE',
      course_tier_expires_at = NULL,
      updated_at = NOW()
    WHERE id = v_record.user_id;

    -- Log the revocation
    INSERT INTO subscription_expiration_logs (
      user_id, tier_type, old_tier, new_tier, expired_at, revoke_method
    ) VALUES (
      v_record.user_id, 'course_tier', v_record.old_tier, 'FREE', v_record.expired_at, 'auto'
    );

    v_count := v_count + 1;

    RETURN NEXT;
  END LOOP;

  RAISE NOTICE 'Revoked % expired subscriptions', v_count;
END;
$$;

-- =====================================================
-- 4. GET EXPIRING USERS FOR ADMIN DASHBOARD (RPC)
-- =====================================================
CREATE OR REPLACE FUNCTION get_expiring_users(
  p_days_ahead INT DEFAULT 7,
  p_tier_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  tier_type TEXT,
  current_tier TEXT,
  expires_at TIMESTAMPTZ,
  days_remaining INT,
  notification_sent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH expiring_subscriptions AS (
    -- Chatbot tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.avatar_url,
      'chatbot_tier'::TEXT AS tier_type,
      p.chatbot_tier AS current_tier,
      p.chatbot_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.chatbot_tier_expires_at - NOW()))::INT AS days_remaining
    FROM profiles p
    WHERE p.chatbot_tier IS NOT NULL
      AND p.chatbot_tier != 'FREE'
      AND p.chatbot_tier_expires_at IS NOT NULL
      AND p.chatbot_tier_expires_at > NOW()
      AND p.chatbot_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
      AND (p_tier_type IS NULL OR p_tier_type = 'chatbot_tier')

    UNION ALL

    -- Scanner tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.avatar_url,
      'scanner_tier'::TEXT AS tier_type,
      p.scanner_tier AS current_tier,
      p.scanner_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.scanner_tier_expires_at - NOW()))::INT AS days_remaining
    FROM profiles p
    WHERE p.scanner_tier IS NOT NULL
      AND p.scanner_tier != 'FREE'
      AND p.scanner_tier_expires_at IS NOT NULL
      AND p.scanner_tier_expires_at > NOW()
      AND p.scanner_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
      AND (p_tier_type IS NULL OR p_tier_type = 'scanner_tier')

    UNION ALL

    -- Course tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.avatar_url,
      'course_tier'::TEXT AS tier_type,
      p.course_tier AS current_tier,
      p.course_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.course_tier_expires_at - NOW()))::INT AS days_remaining
    FROM profiles p
    WHERE p.course_tier IS NOT NULL
      AND p.course_tier != 'FREE'
      AND p.course_tier_expires_at IS NOT NULL
      AND p.course_tier_expires_at > NOW()
      AND p.course_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
      AND (p_tier_type IS NULL OR p_tier_type = 'course_tier')
  )
  SELECT
    es.user_id,
    es.email,
    es.full_name,
    es.avatar_url,
    es.tier_type,
    es.current_tier,
    es.expires_at,
    es.days_remaining,
    EXISTS (
      SELECT 1 FROM subscription_expiration_notifications sen
      WHERE sen.user_id = es.user_id
        AND sen.tier_type = es.tier_type
        AND DATE(sen.expires_at) = DATE(es.expires_at)
        AND sen.notification_type = CASE
          WHEN es.days_remaining <= 1 THEN '1_day'
          WHEN es.days_remaining <= 3 THEN '3_days'
          ELSE '7_days'
        END
    ) AS notification_sent
  FROM expiring_subscriptions es
  ORDER BY es.days_remaining ASC, es.expires_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- 5. GET EXPIRING USERS COUNT FOR ADMIN DASHBOARD
-- =====================================================
CREATE OR REPLACE FUNCTION get_expiring_users_count(
  p_days_ahead INT DEFAULT 7
)
RETURNS TABLE (
  total_expiring INT,
  expiring_today INT,
  expiring_3_days INT,
  expiring_7_days INT,
  chatbot_expiring INT,
  scanner_expiring INT,
  course_expiring INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total expiring in next p_days_ahead days
    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE (
        (p.chatbot_tier_expires_at IS NOT NULL AND p.chatbot_tier != 'FREE' AND
         p.chatbot_tier_expires_at > NOW() AND p.chatbot_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL)
        OR
        (p.scanner_tier_expires_at IS NOT NULL AND p.scanner_tier != 'FREE' AND
         p.scanner_tier_expires_at > NOW() AND p.scanner_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL)
        OR
        (p.course_tier_expires_at IS NOT NULL AND p.course_tier != 'FREE' AND
         p.course_tier_expires_at > NOW() AND p.course_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL)
      )
    ) AS total_expiring,

    -- Expiring today
    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE (
        (p.chatbot_tier_expires_at IS NOT NULL AND p.chatbot_tier != 'FREE' AND
         DATE(p.chatbot_tier_expires_at) = CURRENT_DATE)
        OR
        (p.scanner_tier_expires_at IS NOT NULL AND p.scanner_tier != 'FREE' AND
         DATE(p.scanner_tier_expires_at) = CURRENT_DATE)
        OR
        (p.course_tier_expires_at IS NOT NULL AND p.course_tier != 'FREE' AND
         DATE(p.course_tier_expires_at) = CURRENT_DATE)
      )
    ) AS expiring_today,

    -- Expiring in 3 days
    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE (
        (p.chatbot_tier_expires_at IS NOT NULL AND p.chatbot_tier != 'FREE' AND
         p.chatbot_tier_expires_at > NOW() AND p.chatbot_tier_expires_at <= NOW() + '3 days'::INTERVAL)
        OR
        (p.scanner_tier_expires_at IS NOT NULL AND p.scanner_tier != 'FREE' AND
         p.scanner_tier_expires_at > NOW() AND p.scanner_tier_expires_at <= NOW() + '3 days'::INTERVAL)
        OR
        (p.course_tier_expires_at IS NOT NULL AND p.course_tier != 'FREE' AND
         p.course_tier_expires_at > NOW() AND p.course_tier_expires_at <= NOW() + '3 days'::INTERVAL)
      )
    ) AS expiring_3_days,

    -- Expiring in 7 days
    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE (
        (p.chatbot_tier_expires_at IS NOT NULL AND p.chatbot_tier != 'FREE' AND
         p.chatbot_tier_expires_at > NOW() AND p.chatbot_tier_expires_at <= NOW() + '7 days'::INTERVAL)
        OR
        (p.scanner_tier_expires_at IS NOT NULL AND p.scanner_tier != 'FREE' AND
         p.scanner_tier_expires_at > NOW() AND p.scanner_tier_expires_at <= NOW() + '7 days'::INTERVAL)
        OR
        (p.course_tier_expires_at IS NOT NULL AND p.course_tier != 'FREE' AND
         p.course_tier_expires_at > NOW() AND p.course_tier_expires_at <= NOW() + '7 days'::INTERVAL)
      )
    ) AS expiring_7_days,

    -- By tier type
    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE p.chatbot_tier_expires_at IS NOT NULL AND p.chatbot_tier != 'FREE' AND
            p.chatbot_tier_expires_at > NOW() AND p.chatbot_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
    ) AS chatbot_expiring,

    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE p.scanner_tier_expires_at IS NOT NULL AND p.scanner_tier != 'FREE' AND
            p.scanner_tier_expires_at > NOW() AND p.scanner_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
    ) AS scanner_expiring,

    (
      SELECT COUNT(*)::INT FROM profiles p
      WHERE p.course_tier_expires_at IS NOT NULL AND p.course_tier != 'FREE' AND
            p.course_tier_expires_at > NOW() AND p.course_tier_expires_at <= NOW() + (p_days_ahead || ' days')::INTERVAL
    ) AS course_expiring;
END;
$$;

-- =====================================================
-- 6. SEND EXPIRATION NOTIFICATIONS (RPC)
-- Records that notification was sent for a user/tier
-- =====================================================
CREATE OR REPLACE FUNCTION record_expiration_notification(
  p_user_id UUID,
  p_tier_type TEXT,
  p_current_tier TEXT,
  p_expires_at TIMESTAMPTZ,
  p_notification_type TEXT,
  p_days_remaining INT,
  p_push_sent BOOLEAN DEFAULT FALSE,
  p_in_app_sent BOOLEAN DEFAULT FALSE,
  p_email_sent BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO subscription_expiration_notifications (
    user_id, tier_type, current_tier, expires_at, expiration_date,
    notification_type, days_remaining,
    push_sent, in_app_sent, email_sent
  ) VALUES (
    p_user_id, p_tier_type, p_current_tier, p_expires_at, p_expires_at::DATE,
    p_notification_type, p_days_remaining,
    p_push_sent, p_in_app_sent, p_email_sent
  )
  ON CONFLICT (user_id, tier_type, notification_type, expiration_date)
  DO UPDATE SET
    push_sent = EXCLUDED.push_sent OR subscription_expiration_notifications.push_sent,
    in_app_sent = EXCLUDED.in_app_sent OR subscription_expiration_notifications.in_app_sent,
    email_sent = EXCLUDED.email_sent OR subscription_expiration_notifications.email_sent,
    sent_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- =====================================================
-- 7. GET USERS NEEDING EXPIRATION NOTIFICATIONS
-- =====================================================
CREATE OR REPLACE FUNCTION get_users_needing_expiration_notifications()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  push_token TEXT,
  tier_type TEXT,
  current_tier TEXT,
  expires_at TIMESTAMPTZ,
  days_remaining INT,
  notification_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH users_to_notify AS (
    -- Users with chatbot tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.push_token,
      'chatbot_tier'::TEXT AS tier_type,
      p.chatbot_tier AS current_tier,
      p.chatbot_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.chatbot_tier_expires_at - NOW()))::INT AS days_remaining,
      CASE
        WHEN p.chatbot_tier_expires_at <= NOW() + '1 day'::INTERVAL THEN '1_day'
        WHEN p.chatbot_tier_expires_at <= NOW() + '3 days'::INTERVAL THEN '3_days'
        WHEN p.chatbot_tier_expires_at <= NOW() + '7 days'::INTERVAL THEN '7_days'
        ELSE NULL
      END AS notification_type
    FROM profiles p
    WHERE p.chatbot_tier IS NOT NULL
      AND p.chatbot_tier != 'FREE'
      AND p.chatbot_tier_expires_at IS NOT NULL
      AND p.chatbot_tier_expires_at > NOW()
      AND p.chatbot_tier_expires_at <= NOW() + '7 days'::INTERVAL

    UNION ALL

    -- Users with scanner tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.push_token,
      'scanner_tier'::TEXT AS tier_type,
      p.scanner_tier AS current_tier,
      p.scanner_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.scanner_tier_expires_at - NOW()))::INT AS days_remaining,
      CASE
        WHEN p.scanner_tier_expires_at <= NOW() + '1 day'::INTERVAL THEN '1_day'
        WHEN p.scanner_tier_expires_at <= NOW() + '3 days'::INTERVAL THEN '3_days'
        WHEN p.scanner_tier_expires_at <= NOW() + '7 days'::INTERVAL THEN '7_days'
        ELSE NULL
      END AS notification_type
    FROM profiles p
    WHERE p.scanner_tier IS NOT NULL
      AND p.scanner_tier != 'FREE'
      AND p.scanner_tier_expires_at IS NOT NULL
      AND p.scanner_tier_expires_at > NOW()
      AND p.scanner_tier_expires_at <= NOW() + '7 days'::INTERVAL

    UNION ALL

    -- Users with course tier expiring
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.push_token,
      'course_tier'::TEXT AS tier_type,
      p.course_tier AS current_tier,
      p.course_tier_expires_at AS expires_at,
      EXTRACT(DAY FROM (p.course_tier_expires_at - NOW()))::INT AS days_remaining,
      CASE
        WHEN p.course_tier_expires_at <= NOW() + '1 day'::INTERVAL THEN '1_day'
        WHEN p.course_tier_expires_at <= NOW() + '3 days'::INTERVAL THEN '3_days'
        WHEN p.course_tier_expires_at <= NOW() + '7 days'::INTERVAL THEN '7_days'
        ELSE NULL
      END AS notification_type
    FROM profiles p
    WHERE p.course_tier IS NOT NULL
      AND p.course_tier != 'FREE'
      AND p.course_tier_expires_at IS NOT NULL
      AND p.course_tier_expires_at > NOW()
      AND p.course_tier_expires_at <= NOW() + '7 days'::INTERVAL
  )
  SELECT
    u.user_id,
    u.email,
    u.full_name,
    u.push_token,
    u.tier_type,
    u.current_tier,
    u.expires_at,
    u.days_remaining,
    u.notification_type
  FROM users_to_notify u
  WHERE u.notification_type IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM subscription_expiration_notifications sen
      WHERE sen.user_id = u.user_id
        AND sen.tier_type = u.tier_type
        AND sen.notification_type = u.notification_type
        AND DATE(sen.expires_at) = DATE(u.expires_at)
    )
  ORDER BY u.days_remaining ASC;
END;
$$;

-- =====================================================
-- 8. GET EXPIRATION LOGS FOR ADMIN
-- =====================================================
CREATE OR REPLACE FUNCTION get_expiration_logs(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  tier_type TEXT,
  old_tier TEXT,
  new_tier TEXT,
  expired_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoke_method TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sel.id,
    sel.user_id,
    p.email,
    p.full_name,
    sel.tier_type,
    sel.old_tier,
    sel.new_tier,
    sel.expired_at,
    sel.revoked_at,
    sel.revoke_method
  FROM subscription_expiration_logs sel
  JOIN profiles p ON p.id = sel.user_id
  WHERE (p_user_id IS NULL OR sel.user_id = p_user_id)
  ORDER BY sel.revoked_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- 9. EXTEND USER SUBSCRIPTION (Admin function)
-- =====================================================
CREATE OR REPLACE FUNCTION admin_extend_subscription(
  p_user_id UUID,
  p_tier_type TEXT,
  p_days INT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_expires TIMESTAMPTZ;
  v_new_expires TIMESTAMPTZ;
  v_current_tier TEXT;
BEGIN
  -- Get current expiration
  IF p_tier_type = 'chatbot_tier' THEN
    SELECT chatbot_tier, chatbot_tier_expires_at INTO v_current_tier, v_current_expires
    FROM profiles WHERE id = p_user_id;
  ELSIF p_tier_type = 'scanner_tier' THEN
    SELECT scanner_tier, scanner_tier_expires_at INTO v_current_tier, v_current_expires
    FROM profiles WHERE id = p_user_id;
  ELSIF p_tier_type = 'course_tier' THEN
    SELECT course_tier, course_tier_expires_at INTO v_current_tier, v_current_expires
    FROM profiles WHERE id = p_user_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tier_type');
  END IF;

  -- Calculate new expiration
  IF v_current_expires IS NULL OR v_current_expires < NOW() THEN
    v_new_expires := NOW() + (p_days || ' days')::INTERVAL;
  ELSE
    v_new_expires := v_current_expires + (p_days || ' days')::INTERVAL;
  END IF;

  -- Update expiration
  IF p_tier_type = 'chatbot_tier' THEN
    UPDATE profiles SET chatbot_tier_expires_at = v_new_expires, updated_at = NOW() WHERE id = p_user_id;
  ELSIF p_tier_type = 'scanner_tier' THEN
    UPDATE profiles SET scanner_tier_expires_at = v_new_expires, updated_at = NOW() WHERE id = p_user_id;
  ELSIF p_tier_type = 'course_tier' THEN
    UPDATE profiles SET course_tier_expires_at = v_new_expires, updated_at = NOW() WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'tier_type', p_tier_type,
    'current_tier', v_current_tier,
    'old_expires_at', v_current_expires,
    'new_expires_at', v_new_expires,
    'days_extended', p_days
  );
END;
$$;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_and_revoke_expired_subscriptions() TO service_role;
GRANT EXECUTE ON FUNCTION get_expiring_users(INT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_users_count(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_expiration_notification(UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, INT, BOOLEAN, BOOLEAN, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION get_users_needing_expiration_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION get_expiration_logs(INT, INT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_extend_subscription(UUID, TEXT, INT, TEXT) TO authenticated;

-- =====================================================
-- DONE
-- =====================================================
COMMENT ON TABLE subscription_expiration_logs IS 'Logs of auto-revoked subscriptions';
COMMENT ON TABLE subscription_expiration_notifications IS 'Tracks which expiration notifications were sent';
COMMENT ON FUNCTION check_and_revoke_expired_subscriptions() IS 'Scheduled function to auto-downgrade expired subscriptions';
COMMENT ON FUNCTION get_expiring_users(INT, TEXT, INT, INT) IS 'Admin dashboard: get users with expiring subscriptions';
