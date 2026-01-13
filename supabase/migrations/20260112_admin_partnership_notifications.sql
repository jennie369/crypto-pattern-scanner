-- ============================================================
-- ADMIN PARTNERSHIP NOTIFICATIONS
-- Push notifications to admins for partnership events
-- Created: 2026-01-12
-- ============================================================

-- ============================================================
-- 1. HELPER FUNCTION: Get all admin user IDs
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS TABLE(user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM profiles p
  WHERE p.role = 'admin'
     OR p.is_admin = true
     OR p.id IN (
       SELECT au.user_id
       FROM admin_users au
       WHERE au.is_active = true
     );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. HELPER FUNCTION: Send push notification to all admins
-- ============================================================

CREATE OR REPLACE FUNCTION notify_admins_push(
  p_title TEXT,
  p_body TEXT,
  p_notification_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_admin_id UUID;
  v_count INTEGER := 0;
  v_push_token TEXT;
BEGIN
  -- Insert in-app notifications for all admins
  FOR v_admin_id IN SELECT user_id FROM get_admin_user_ids()
  LOOP
    -- Insert to notifications table (in-app)
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data,
      is_read,
      created_at
    ) VALUES (
      v_admin_id,
      p_notification_type,
      p_title,
      p_body,
      p_metadata,
      false,
      NOW()
    );

    -- Also insert to forum_notifications for badge count
    INSERT INTO forum_notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      is_read,
      created_at
    ) VALUES (
      v_admin_id,
      p_notification_type,
      p_title,
      p_body,
      p_metadata,
      false,
      NOW()
    ) ON CONFLICT DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. TRIGGER FUNCTION: Notify admins on NEW application
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_notify_admins_new_partnership_application()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_type_display TEXT;
  v_notified_count INTEGER;
BEGIN
  -- Only trigger on INSERT with pending status
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN

    -- Determine application type display
    IF NEW.application_type = 'kol' THEN
      v_type_display := 'KOL Affiliate';
      v_title := '🌟 Đơn đăng ký KOL mới!';
    ELSE
      v_type_display := 'CTV (Cộng Tác Viên)';
      v_title := '📋 Đơn đăng ký CTV mới!';
    END IF;

    v_body := format('%s vừa đăng ký làm %s. Vui lòng kiểm tra và xử lý.',
      COALESCE(NEW.full_name, 'Người dùng'),
      v_type_display
    );

    -- Notify all admins
    SELECT notify_admins_push(
      v_title,
      v_body,
      'new_partnership_application',
      jsonb_build_object(
        'application_id', NEW.id,
        'application_type', NEW.application_type,
        'applicant_name', NEW.full_name,
        'applicant_email', NEW.email,
        'user_id', NEW.user_id,
        'screen', 'AdminApplications',
        'created_at', NEW.created_at
      )
    ) INTO v_notified_count;

    RAISE NOTICE '[Partnership] Notified % admins about new % application from %',
      v_notified_count, NEW.application_type, NEW.full_name;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. CREATE TRIGGER on partnership_applications
-- ============================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_admins_new_partnership ON partnership_applications;

-- Create new trigger
CREATE TRIGGER trigger_notify_admins_new_partnership
  AFTER INSERT ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_admins_new_partnership_application();

-- ============================================================
-- 5. FUNCTION: Notify admins on CTV auto-approve
-- Called from Edge Function after auto-approve
-- ============================================================

CREATE OR REPLACE FUNCTION notify_admins_ctv_auto_approved(
  p_user_id UUID,
  p_full_name TEXT,
  p_referral_code TEXT,
  p_application_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_notified_count INTEGER;
BEGIN
  SELECT notify_admins_push(
    '✅ CTV được tự động duyệt',
    format('%s đã được tự động duyệt thành CTV sau 3 ngày. Mã: %s',
      COALESCE(p_full_name, 'Người dùng'),
      p_referral_code
    ),
    'ctv_auto_approved',
    jsonb_build_object(
      'user_id', p_user_id,
      'full_name', p_full_name,
      'referral_code', p_referral_code,
      'application_id', p_application_id,
      'screen', 'AdminPartners',
      'auto_approved', true
    )
  ) INTO v_notified_count;

  RETURN v_notified_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. FUNCTION: Notify admins on CTV tier upgrade
-- Called from Edge Function after tier upgrade
-- ============================================================

CREATE OR REPLACE FUNCTION notify_admins_ctv_tier_upgraded(
  p_user_id UUID,
  p_full_name TEXT,
  p_from_tier TEXT,
  p_to_tier TEXT,
  p_total_sales NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  v_notified_count INTEGER;
  v_tier_names JSONB := '{
    "bronze": "🥉 Đồng",
    "silver": "🥈 Bạc",
    "gold": "🥇 Vàng",
    "platinum": "💎 Bạch Kim",
    "diamond": "👑 Kim Cương"
  }'::JSONB;
  v_from_display TEXT;
  v_to_display TEXT;
BEGIN
  v_from_display := COALESCE(v_tier_names->>p_from_tier, p_from_tier);
  v_to_display := COALESCE(v_tier_names->>p_to_tier, p_to_tier);

  SELECT notify_admins_push(
    '🚀 CTV thăng cấp tự động',
    format('%s đã thăng từ %s lên %s. Doanh số: %s VND',
      COALESCE(p_full_name, 'CTV'),
      v_from_display,
      v_to_display,
      TO_CHAR(p_total_sales, 'FM999,999,999,999')
    ),
    'ctv_tier_upgraded',
    jsonb_build_object(
      'user_id', p_user_id,
      'full_name', p_full_name,
      'from_tier', p_from_tier,
      'to_tier', p_to_tier,
      'total_sales', p_total_sales,
      'screen', 'AdminPartners'
    )
  ) INTO v_notified_count;

  RETURN v_notified_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. FUNCTION: Notify admins on CTV tier downgrade
-- Called from Edge Function after tier downgrade
-- ============================================================

CREATE OR REPLACE FUNCTION notify_admins_ctv_tier_downgraded(
  p_user_id UUID,
  p_full_name TEXT,
  p_from_tier TEXT,
  p_to_tier TEXT,
  p_monthly_sales NUMERIC,
  p_required_sales NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  v_notified_count INTEGER;
  v_tier_names JSONB := '{
    "bronze": "🥉 Đồng",
    "silver": "🥈 Bạc",
    "gold": "🥇 Vàng",
    "platinum": "💎 Bạch Kim",
    "diamond": "👑 Kim Cương"
  }'::JSONB;
  v_from_display TEXT;
  v_to_display TEXT;
BEGIN
  v_from_display := COALESCE(v_tier_names->>p_from_tier, p_from_tier);
  v_to_display := COALESCE(v_tier_names->>p_to_tier, p_to_tier);

  SELECT notify_admins_push(
    '📉 CTV hạ cấp tự động',
    format('%s hạ từ %s xuống %s. Doanh số tháng: %s / %s VND',
      COALESCE(p_full_name, 'CTV'),
      v_from_display,
      v_to_display,
      TO_CHAR(p_monthly_sales, 'FM999,999,999,999'),
      TO_CHAR(p_required_sales, 'FM999,999,999,999')
    ),
    'ctv_tier_downgraded',
    jsonb_build_object(
      'user_id', p_user_id,
      'full_name', p_full_name,
      'from_tier', p_from_tier,
      'to_tier', p_to_tier,
      'monthly_sales', p_monthly_sales,
      'required_sales', p_required_sales,
      'screen', 'AdminPartners'
    )
  ) INTO v_notified_count;

  RETURN v_notified_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. Grant permissions
-- ============================================================

GRANT EXECUTE ON FUNCTION get_admin_user_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_admins_push(TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_admins_ctv_auto_approved(UUID, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION notify_admins_ctv_tier_upgraded(UUID, TEXT, TEXT, TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION notify_admins_ctv_tier_downgraded(UUID, TEXT, TEXT, TEXT, NUMERIC, NUMERIC) TO service_role;

-- ============================================================
-- DONE
-- ============================================================

COMMENT ON FUNCTION notify_admins_push IS 'Send in-app notification to all admin users';
COMMENT ON FUNCTION trigger_notify_admins_new_partnership_application IS 'Trigger to notify admins when new partnership application is submitted';
COMMENT ON FUNCTION notify_admins_ctv_auto_approved IS 'Notify admins when CTV is auto-approved after 3 days';
COMMENT ON FUNCTION notify_admins_ctv_tier_upgraded IS 'Notify admins when CTV tier is automatically upgraded';
COMMENT ON FUNCTION notify_admins_ctv_tier_downgraded IS 'Notify admins when CTV tier is automatically downgraded';
