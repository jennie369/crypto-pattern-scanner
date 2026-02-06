-- ============================================================
-- FIX: partnership_applications trigger error
-- Error: record "new" has no field "source"
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop ALL triggers on partnership_applications to start fresh
DROP TRIGGER IF EXISTS trg_set_ctv_auto_approve ON partnership_applications;
DROP TRIGGER IF EXISTS trigger_update_partnership_applications ON partnership_applications;
DROP TRIGGER IF EXISTS trigger_notify_admins_new_partnership ON partnership_applications;
DROP TRIGGER IF EXISTS trigger_partnership_applications_insert ON partnership_applications;
DROP TRIGGER IF EXISTS trigger_partnership_applications_update ON partnership_applications;

-- 2. Recreate ONLY the valid trigger functions

-- Function: Set auto_approve_at for CTV applications (3 days)
CREATE OR REPLACE FUNCTION set_ctv_auto_approve_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_type = 'ctv' AND NEW.status = 'pending' THEN
    NEW.auto_approve_at = COALESCE(NEW.created_at, NOW()) + INTERVAL '3 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partnership_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Notify admins on new application (NO reference to source field)
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

    -- Notify all admins (if function exists)
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      -- notify_admins_push function may not exist, ignore error
      v_notified_count := 0;
    END;

    RAISE NOTICE '[Partnership] Notified % admins about new % application from %',
      v_notified_count, NEW.application_type, NEW.full_name;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate triggers

-- Trigger: Set auto_approve_at BEFORE INSERT
CREATE TRIGGER trg_set_ctv_auto_approve
  BEFORE INSERT ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_ctv_auto_approve_at();

-- Trigger: Update updated_at BEFORE UPDATE
CREATE TRIGGER trigger_update_partnership_applications
  BEFORE UPDATE ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_applications_updated_at();

-- Trigger: Notify admins AFTER INSERT
CREATE TRIGGER trigger_notify_admins_new_partnership
  AFTER INSERT ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_admins_new_partnership_application();

-- 4. Verify triggers are created
SELECT
  tgname AS trigger_name,
  tgtype,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'partnership_applications'
  AND NOT tgisinternal;

-- Done!
SELECT 'SUCCESS: Partnership triggers have been fixed!' AS result;
