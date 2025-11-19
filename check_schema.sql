-- Run this in Supabase SQL Editor to check table schema

-- Check if backtestresults table exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'backtestresults'
ORDER BY ordinal_position;

-- If no results, table doesn't exist (good - just deploy migration)
-- If results show missing 'avg_loss' column, need to ALTER or DROP/RECREATE
