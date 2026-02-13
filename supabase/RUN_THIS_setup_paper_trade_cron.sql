-- ═══════════════════════════════════════════════════════════
-- PAPER TRADE MONITOR CRON JOB SETUP
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Delete existing job if exists (to avoid duplicates)
DO $$
BEGIN
  PERFORM cron.unschedule('paper-trade-monitor');
EXCEPTION WHEN OTHERS THEN
  NULL; -- Job doesn't exist, ignore
END $$;

-- 2. Create the cron job (runs every 1 minute)
SELECT cron.schedule(
  'paper-trade-monitor',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nyphoijfcmvwzlwlfrur.supabase.co/functions/v1/paper-trade-monitor-cron',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cGhvaWpmY212d3psd2xmcnVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU5NjI3NCwiZXhwIjoyMDQ1MTcyMjc0fQ.xG3jJtNAYlELCozwGxhbK4B3FJyj0GNJyE3k7mJJ1eU"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- 3. Verify the job was created
SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'paper-trade-monitor';

-- ═══════════════════════════════════════════════════════════
-- USEFUL COMMANDS:
-- ═══════════════════════════════════════════════════════════

-- Check job execution history:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'paper-trade-monitor') ORDER BY start_time DESC LIMIT 10;

-- Disable temporarily:
-- SELECT cron.unschedule('paper-trade-monitor');

-- Manual test:
-- SELECT net.http_post(
--   url := 'https://nyphoijfcmvwzlwlfrur.supabase.co/functions/v1/paper-trade-monitor-cron',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--   body := '{}'::jsonb
-- );

-- ═══════════════════════════════════════════════════════════
-- NOTES:
-- ═══════════════════════════════════════════════════════════
-- 1. Deploy Edge Function first: supabase functions deploy paper-trade-monitor-cron
-- 2. Runs every 1 minute (pg_cron minimum)
-- 3. Cost: ~1,440 invocations/day = ~43,200/month (within free tier)
-- ═══════════════════════════════════════════════════════════
