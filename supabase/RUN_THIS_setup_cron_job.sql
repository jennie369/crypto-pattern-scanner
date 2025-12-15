-- ============================================================
-- SUBSCRIPTION CHECKER CRON JOB SETUP
-- ============================================================
-- Run this in Supabase SQL Editor AFTER enabling extensions
--
-- STEP 1: Go to Supabase Dashboard > Database > Extensions
-- STEP 2: Enable "pg_cron" and "pg_net"
-- STEP 3: Run this SQL
-- ============================================================

-- Verify extensions are enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE EXCEPTION 'pg_cron extension is not enabled. Please enable it in Dashboard > Database > Extensions';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE EXCEPTION 'pg_net extension is not enabled. Please enable it in Dashboard > Database > Extensions';
  END IF;
  RAISE NOTICE '✅ Both extensions are enabled!';
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Remove existing job if exists (to avoid duplicates)
SELECT cron.unschedule('subscription-checker-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'subscription-checker-daily');

-- Schedule the job: Daily at 00:00 Vietnam time (17:00 UTC)
SELECT cron.schedule(
  'subscription-checker-daily',
  '0 17 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/subscription-checker',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc"}'::jsonb,
    body := '{"action": "both"}'::jsonb
  ) AS request_id;
  $$
);

-- Verify job was created
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname = 'subscription-checker-daily';

-- ============================================================
-- QUOTA CLEANUP CRON JOB
-- Removes quota records older than 30 days
-- Runs weekly on Sunday at 03:00 Vietnam time (20:00 UTC Saturday)
-- ============================================================

-- Remove existing quota cleanup job if exists
SELECT cron.unschedule('quota-cleanup-weekly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'quota-cleanup-weekly');

-- Schedule quota cleanup job
SELECT cron.schedule(
  'quota-cleanup-weekly',
  '0 20 * * 6',  -- 03:00 Vietnam time on Sunday
  $$SELECT cleanup_all_quota_records();$$
);

-- Verify quota cleanup job was created
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname = 'quota-cleanup-weekly';

-- ============================================================
-- USEFUL COMMANDS (run these anytime to check status)
-- ============================================================

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- View recent job runs
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Manually trigger the job for testing
-- SELECT net.http_post(
--   url := 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/subscription-checker',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc"}'::jsonb,
--   body := '{"action": "both"}'::jsonb
-- );

-- Delete the job if needed
-- SELECT cron.unschedule('subscription-checker-daily');
