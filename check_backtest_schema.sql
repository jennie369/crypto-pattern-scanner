-- Check what columns backtestconfigs actually has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'backtestconfigs'
ORDER BY ordinal_position;
