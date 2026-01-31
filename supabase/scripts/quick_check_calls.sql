-- ============================================================
-- QUICK CHECK: CALL SYSTEM REQUIREMENTS
-- Copy & paste vào Supabase SQL Editor
-- ============================================================

WITH checks AS (
  -- Check 1: calls table exists
  SELECT 1 as check_order, 'calls table' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calls')
    THEN 'OK' ELSE 'MISSING' END as status

  UNION ALL

  -- Check 2: callee_id column (CRITICAL!)
  SELECT 2, 'calls.callee_id column',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'calls' AND column_name = 'callee_id'
    ) THEN 'OK' ELSE 'MISSING - RUN MIGRATION!' END

  UNION ALL

  -- Check 3: call_participants table
  SELECT 3, 'call_participants table',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_participants')
    THEN 'OK' ELSE 'MISSING' END

  UNION ALL

  -- Check 4: call_events table
  SELECT 4, 'call_events table',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_events')
    THEN 'OK' ELSE 'MISSING (optional)' END

  UNION ALL

  -- Check 5: RLS on calls
  SELECT 5, 'RLS on calls',
    CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'calls')
    THEN 'ENABLED' ELSE 'DISABLED' END

  UNION ALL

  -- Check 6: RLS policies on calls
  SELECT 6, 'RLS policies on calls',
    (SELECT COUNT(*)::text || ' policies' FROM pg_policies WHERE tablename = 'calls')

  UNION ALL

  -- Check 7: end_call function
  SELECT 7, 'end_call function',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.routines WHERE routine_name = 'end_call'
    ) THEN 'OK' ELSE 'MISSING' END

  UNION ALL

  -- Check 8: Stale calls count
  SELECT 8, 'Stale calls (ringing/connecting)',
    (SELECT COUNT(*)::text || ' records' FROM calls WHERE status IN ('ringing', 'connecting', 'initiating'))

  UNION ALL

  -- Check 9: Index on callee_id
  SELECT 9, 'Index on calls.callee_id',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'calls' AND indexdef LIKE '%callee_id%'
    ) THEN 'OK' ELSE 'MISSING (run migration)' END
)
SELECT
  item as "Check Item",
  status as "Status",
  CASE
    WHEN status LIKE '%MISSING%' OR status LIKE '%DISABLED%' THEN '!!!'
    WHEN status LIKE '%records%' AND status != '0 records' THEN '?'
    ELSE ''
  END as "Action"
FROM checks
ORDER BY check_order;

-- ============================================================
-- If callee_id is MISSING, run this:
-- ============================================================
/*
ALTER TABLE calls ADD COLUMN callee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_calls_callee_id ON calls(callee_id);
*/

-- ============================================================
-- If stale calls exist, run this:
-- ============================================================
/*
UPDATE calls SET status = 'missed', ended_at = NOW()
WHERE status IN ('ringing', 'connecting', 'initiating');

UPDATE call_participants SET status = 'missed'
WHERE status IN ('ringing', 'connecting', 'invited');
*/
