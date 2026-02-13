/**
 * Subscription Checker Cron Job
 * Runs daily at midnight (Vietnam timezone = UTC+7)
 *
 * This schedules the Edge Function to run automatically
 *
 * PREREQUISITES:
 * 1. Enable pg_cron extension in Supabase Dashboard > Database > Extensions
 * 2. Enable pg_net extension in Supabase Dashboard > Database > Extensions
 */

-- Enable extensions (run these FIRST in SQL Editor if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================================
-- OPTION A: Call Edge Function via HTTP (Recommended)
-- ============================================================

-- Schedule job to run at 00:00 Vietnam time (17:00 UTC previous day)
-- Cron format: minute hour day month weekday
-- '0 17 * * *' = Every day at 17:00 UTC = 00:00 Vietnam time

SELECT cron.schedule(
  'subscription-checker-daily',           -- Job name
  '0 17 * * *',                            -- Cron expression (00:00 Vietnam time)
  $$
  SELECT net.http_post(
    url := 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/subscription-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc'
    ),
    body := jsonb_build_object('action', 'both')
  ) AS request_id;
  $$
);

-- ============================================================
-- OPTION B: Run directly in database (Alternative)
-- If Edge Function not deployed, run RPC directly
-- ============================================================

-- Create a wrapper function that does both check and notify
CREATE OR REPLACE FUNCTION run_subscription_checker()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  revoked_result jsonb;
  users_to_notify jsonb;
  result jsonb;
BEGIN
  -- 1. Check and revoke expired subscriptions
  SELECT jsonb_agg(row_to_json(r))
  INTO revoked_result
  FROM check_and_revoke_expired_subscriptions() r;

  -- 2. Get users needing notifications (for logging purposes)
  SELECT jsonb_agg(row_to_json(u))
  INTO users_to_notify
  FROM get_users_needing_expiration_notifications() u;

  -- 3. Create in-app notifications for users needing reminders
  INSERT INTO notifications (user_id, type, title, body, data, is_read)
  SELECT
    user_id,
    'subscription_expiring',
    CASE notification_type
      WHEN '7_days' THEN 'Gói subscription sắp hết hạn'
      WHEN '3_days' THEN 'Gói subscription sắp hết hạn!'
      WHEN '1_day' THEN 'Gói subscription hết hạn ngày mai!'
    END,
    CASE notification_type
      WHEN '7_days' THEN 'Gói của bạn sẽ hết hạn sau 7 ngày. Gia hạn ngay!'
      WHEN '3_days' THEN 'Chỉ còn 3 ngày nữa là gói của bạn hết hạn!'
      WHEN '1_day' THEN 'Gói của bạn sẽ hết hạn vào ngày mai!'
    END,
    jsonb_build_object(
      'tier_type', tier_type,
      'current_tier', current_tier,
      'days_remaining', days_remaining,
      'expires_at', expires_at,
      'action', 'renew'
    ),
    false
  FROM get_users_needing_expiration_notifications();

  -- 4. Record notifications sent
  INSERT INTO subscription_expiration_notifications
    (user_id, tier_type, current_tier, expires_at, notification_type, days_remaining, in_app_sent)
  SELECT
    user_id,
    tier_type,
    current_tier,
    expires_at::timestamptz,
    notification_type,
    days_remaining,
    true
  FROM get_users_needing_expiration_notifications();

  result := jsonb_build_object(
    'success', true,
    'timestamp', NOW(),
    'revoked', COALESCE(revoked_result, '[]'::jsonb),
    'notified', COALESCE(users_to_notify, '[]'::jsonb)
  );

  RAISE NOTICE '[SubscriptionChecker] Result: %', result;

  RETURN result;
END;
$$;

-- Alternative cron job using direct database function
-- Uncomment this if you prefer not to use Edge Function
/*
SELECT cron.schedule(
  'subscription-checker-db-daily',
  '0 17 * * *',  -- 00:00 Vietnam time
  $$SELECT run_subscription_checker();$$
);
*/

-- ============================================================
-- MANAGEMENT COMMANDS
-- ============================================================

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- View job run history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Unschedule a job
-- SELECT cron.unschedule('subscription-checker-daily');

-- Run job manually (for testing)
-- SELECT run_subscription_checker();

-- ============================================================
-- PROJECT INFO (Already configured)
-- ============================================================
-- Project: pgfkbcnzqozzkohwbgbk
-- Edge Function URL: https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/subscription-checker
-- Schedule: Daily at 00:00 Vietnam time (17:00 UTC)
-- ============================================================
