-- ============================================================================
-- SETUP CRON JOBS
-- Scheduled tasks for automated system maintenance
-- Run in Supabase SQL Editor
-- ============================================================================
-- NOTE: pg_cron is already enabled and managed by Supabase
-- Do NOT run CREATE EXTENSION or GRANT commands
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOB 1: EXPIRE SCANNER TRIALS
-- Runs daily at 00:00 UTC (7:00 AM Vietnam time)
-- Reverts expired scanner trials back to original tier
-- ═══════════════════════════════════════════════════════════════════════════

-- Remove existing job if exists (safe approach)
DO $$
BEGIN
  PERFORM cron.unschedule('expire-scanner-trials');
EXCEPTION WHEN OTHERS THEN
  -- Job doesn't exist, ignore
  NULL;
END;
$$;

-- Schedule new job
SELECT cron.schedule(
  'expire-scanner-trials',           -- Job name
  '0 0 * * *',                       -- Every day at 00:00 UTC
  $$
    SELECT public.expire_scanner_trials();
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOB 2: EXPIRE DISCOUNT CODES
-- Runs daily at 01:00 UTC
-- Deactivates expired discount codes
-- ═══════════════════════════════════════════════════════════════════════════

-- Create function to expire discount codes
CREATE OR REPLACE FUNCTION public.expire_discount_codes()
RETURNS JSONB AS $$
DECLARE
  v_expired_count INTEGER := 0;
BEGIN
  -- Deactivate expired codes
  UPDATE public.discount_codes
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE is_active = TRUE
    AND valid_until IS NOT NULL
    AND valid_until < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'expired_count', v_expired_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.expire_discount_codes TO service_role;

-- Remove existing job if exists (safe approach)
DO $$
BEGIN
  PERFORM cron.unschedule('expire-discount-codes');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Schedule new job
SELECT cron.schedule(
  'expire-discount-codes',           -- Job name
  '0 1 * * *',                       -- Every day at 01:00 UTC
  $$
    SELECT public.expire_discount_codes();
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOB 3: CLEANUP OLD SYSTEM LOGS (Weekly)
-- Runs every Sunday at 02:00 UTC
-- Removes logs older than 30 days
-- ═══════════════════════════════════════════════════════════════════════════

-- Create system_logs table if not exists
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  details JSONB,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON public.system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS JSONB AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  DELETE FROM public.system_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.cleanup_old_logs TO service_role;

-- Remove existing job if exists (safe approach)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-old-logs');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Schedule weekly cleanup
SELECT cron.schedule(
  'cleanup-old-logs',                -- Job name
  '0 2 * * 0',                       -- Every Sunday at 02:00 UTC
  $$
    SELECT public.cleanup_old_logs();
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOB 4: SEND TRIAL EXPIRY REMINDERS (Daily)
-- Runs daily at 08:00 UTC (3:00 PM Vietnam time)
-- Sends push notification to users whose trial expires in 1 or 3 days
-- ═══════════════════════════════════════════════════════════════════════════

-- Create push_notification_queue table if not exists
CREATE TABLE IF NOT EXISTS public.push_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_queue_status ON public.push_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_push_queue_scheduled ON public.push_notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_push_queue_user ON public.push_notification_queue(user_id);

CREATE OR REPLACE FUNCTION public.send_trial_expiry_reminders()
RETURNS JSONB AS $$
DECLARE
  v_reminder_count INTEGER := 0;
  v_user RECORD;
BEGIN
  -- Find users with trial expiring in 1 or 3 days
  FOR v_user IN
    SELECT
      p.id,
      p.expo_push_token,
      p.scanner_trial_ends_at,
      EXTRACT(DAY FROM p.scanner_trial_ends_at - NOW())::INTEGER as days_remaining
    FROM public.profiles p
    WHERE p.scanner_trial_ends_at IS NOT NULL
      AND p.scanner_trial_ends_at > NOW()
      AND p.expo_push_token IS NOT NULL
      AND (
        -- 3 days remaining
        (p.scanner_trial_ends_at - NOW() BETWEEN INTERVAL '2 days 12 hours' AND INTERVAL '3 days 12 hours')
        OR
        -- 1 day remaining
        (p.scanner_trial_ends_at - NOW() BETWEEN INTERVAL '12 hours' AND INTERVAL '1 day 12 hours')
      )
  LOOP
    -- Insert notification into push queue
    INSERT INTO public.push_notification_queue (
      user_id,
      expo_push_token,
      title,
      body,
      data,
      scheduled_for,
      status
    ) VALUES (
      v_user.id,
      v_user.expo_push_token,
      CASE
        WHEN v_user.days_remaining <= 1 THEN '⚠️ Scanner Trial sắp hết!'
        ELSE '📢 Nhắc nhở: Scanner Trial'
      END,
      CASE
        WHEN v_user.days_remaining <= 1 THEN 'Còn 1 ngày để nâng cấp và tiếp tục sử dụng Scanner TIER2. Upgrade ngay!'
        ELSE 'Còn ' || v_user.days_remaining || ' ngày để nâng cấp Scanner. Đừng bỏ lỡ!'
      END,
      jsonb_build_object(
        'type', 'trial_expiry_reminder',
        'screen', 'TierUpgrade',
        'days_remaining', v_user.days_remaining
      ),
      NOW(),
      'pending'
    ) ON CONFLICT DO NOTHING;

    v_reminder_count := v_reminder_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'reminders_queued', v_reminder_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.send_trial_expiry_reminders TO service_role;

-- Remove existing job if exists (safe approach)
DO $$
BEGIN
  PERFORM cron.unschedule('trial-expiry-reminders');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Schedule daily reminders
SELECT cron.schedule(
  'trial-expiry-reminders',          -- Job name
  '0 8 * * *',                       -- Every day at 08:00 UTC (3 PM Vietnam)
  $$
    SELECT public.send_trial_expiry_reminders();
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEW: CHECK ALL SCHEDULED JOBS (Optional - may fail on some Supabase plans)
-- ═══════════════════════════════════════════════════════════════════════════

-- View all cron jobs (wrapped in DO block to handle permission issues)
DO $$
BEGIN
  CREATE OR REPLACE VIEW public.v_cron_jobs AS
  SELECT
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
  FROM cron.job
  ORDER BY jobname;

  GRANT SELECT ON public.v_cron_jobs TO authenticated;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create v_cron_jobs view: %', SQLERRM;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER: MANUALLY RUN A JOB
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.run_cron_job_now(p_job_name TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  CASE p_job_name
    WHEN 'expire-scanner-trials' THEN
      SELECT public.expire_scanner_trials() INTO v_result;
    WHEN 'expire-discount-codes' THEN
      SELECT public.expire_discount_codes() INTO v_result;
    WHEN 'cleanup-old-logs' THEN
      SELECT public.cleanup_old_logs() INTO v_result;
    WHEN 'trial-expiry-reminders' THEN
      SELECT public.send_trial_expiry_reminders() INTO v_result;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Unknown job: ' || p_job_name);
  END CASE;

  -- Log the manual run
  INSERT INTO public.system_logs (event_type, details)
  VALUES ('cron_manual_run', jsonb_build_object('job_name', p_job_name, 'result', v_result));

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.run_cron_job_now TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.expire_scanner_trials IS 'Cron: Daily - Expire scanner trials and revert to original tier';
COMMENT ON FUNCTION public.expire_discount_codes IS 'Cron: Daily - Deactivate expired discount codes';
COMMENT ON FUNCTION public.cleanup_old_logs IS 'Cron: Weekly - Remove system logs older than 30 days';
COMMENT ON FUNCTION public.send_trial_expiry_reminders IS 'Cron: Daily - Send push notifications for expiring trials';
COMMENT ON FUNCTION public.run_cron_job_now IS 'Helper: Manually trigger a cron job';

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY JOBS
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify cron jobs were scheduled (wrapped to handle errors)
DO $$
DECLARE
  v_job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_job_count FROM cron.job
  WHERE jobname IN ('expire-scanner-trials', 'expire-discount-codes', 'cleanup-old-logs', 'trial-expiry-reminders');

  RAISE NOTICE 'Cron Jobs Setup completed! % jobs scheduled.', v_job_count;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not verify cron jobs: %', SQLERRM;
END;
$$;
