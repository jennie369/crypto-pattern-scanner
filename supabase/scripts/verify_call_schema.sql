-- ============================================================
-- VERIFY CALL SYSTEM DATABASE SCHEMA
-- Run this script in Supabase SQL Editor to check all columns
-- ============================================================

-- Check calls table columns
SELECT
  '=== CALLS TABLE ===' as section,
  '' as column_name,
  '' as data_type,
  '' as status;

SELECT
  'calls' as table_name,
  column_name,
  data_type,
  CASE
    WHEN column_name IN (
      'id', 'conversation_id', 'caller_id', 'callee_id',
      'call_type', 'is_group_call', 'status',
      'ring_started_at', 'started_at', 'ended_at', 'duration_seconds',
      'room_id', 'end_reason', 'quality_score', 'network_type',
      'created_at', 'updated_at'
    ) THEN 'OK'
    ELSE 'EXTRA'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'calls'
ORDER BY ordinal_position;

-- Check for MISSING columns in calls
SELECT
  'MISSING IN CALLS' as issue,
  required_column as column_name,
  '' as data_type,
  'MISSING' as status
FROM (
  VALUES
    ('id'), ('conversation_id'), ('caller_id'), ('callee_id'),
    ('call_type'), ('status'), ('ring_started_at'), ('started_at'),
    ('ended_at'), ('duration_seconds'), ('end_reason'),
    ('created_at'), ('updated_at')
) AS required(required_column)
WHERE required_column NOT IN (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'calls'
);

-- Check call_participants table columns
SELECT
  '=== CALL_PARTICIPANTS TABLE ===' as section,
  '' as column_name,
  '' as data_type,
  '' as status;

SELECT
  'call_participants' as table_name,
  column_name,
  data_type,
  CASE
    WHEN column_name IN (
      'id', 'call_id', 'user_id', 'role', 'status',
      'invited_at', 'joined_at', 'left_at',
      'is_muted', 'is_video_enabled', 'is_screen_sharing', 'is_speaker_on',
      'connection_quality', 'device_type', 'created_at', 'updated_at'
    ) THEN 'OK'
    ELSE 'EXTRA'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'call_participants'
ORDER BY ordinal_position;

-- Check for MISSING columns in call_participants
SELECT
  'MISSING IN CALL_PARTICIPANTS' as issue,
  required_column as column_name,
  '' as data_type,
  'MISSING' as status
FROM (
  VALUES
    ('id'), ('call_id'), ('user_id'), ('role'), ('status'),
    ('invited_at'), ('joined_at'), ('left_at'),
    ('is_muted'), ('is_video_enabled'), ('is_speaker_on')
) AS required(required_column)
WHERE required_column NOT IN (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'call_participants'
);

-- Check call_events table exists
SELECT
  '=== CALL_EVENTS TABLE ===' as section,
  '' as column_name,
  '' as data_type,
  '' as status;

SELECT
  'call_events' as table_name,
  column_name,
  data_type,
  'OK' as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'call_events'
ORDER BY ordinal_position;

-- Check if call_events table exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'call_events'
    ) THEN 'call_events table EXISTS'
    ELSE 'call_events table MISSING'
  END as table_status;

-- ============================================================
-- CHECK RLS POLICIES
-- ============================================================
SELECT
  '=== RLS POLICIES ===' as section,
  '' as policy_name,
  '' as table_name;

SELECT
  'RLS' as type,
  policyname as policy_name,
  tablename as table_name
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('calls', 'call_participants', 'call_events')
ORDER BY tablename, policyname;

-- ============================================================
-- CHECK INDEXES
-- ============================================================
SELECT
  '=== INDEXES ===' as section,
  '' as index_name,
  '' as table_name;

SELECT
  'INDEX' as type,
  indexname as index_name,
  tablename as table_name
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('calls', 'call_participants', 'call_events')
ORDER BY tablename, indexname;

-- ============================================================
-- CHECK FUNCTIONS
-- ============================================================
SELECT
  '=== FUNCTIONS ===' as section,
  '' as function_name,
  '' as return_type;

SELECT
  'FUNCTION' as type,
  routine_name as function_name,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'end_call',
  'mark_call_missed',
  'get_call_history',
  'can_call_user',
  'initiate_call'
)
ORDER BY routine_name;

-- Check for MISSING functions
SELECT
  'MISSING FUNCTION' as issue,
  required_func as function_name,
  'MISSING' as status
FROM (
  VALUES
    ('end_call'),
    ('mark_call_missed'),
    ('can_call_user')
) AS required(required_func)
WHERE required_func NOT IN (
  SELECT routine_name
  FROM information_schema.routines
  WHERE routine_schema = 'public'
);

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT '=== SUMMARY ===' as section;

SELECT
  'Tables' as check_type,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'CHECK NEEDED' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('calls', 'call_participants', 'call_events');

SELECT
  'callee_id in calls' as check_type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'calls'
      AND column_name = 'callee_id'
    ) THEN 'EXISTS'
    ELSE 'MISSING - RUN MIGRATION!'
  END as status;

SELECT
  'RLS Enabled on calls' as check_type,
  CASE
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'calls')
    THEN 'ENABLED'
    ELSE 'DISABLED'
  END as status;

SELECT
  'RLS Enabled on call_participants' as check_type,
  CASE
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'call_participants')
    THEN 'ENABLED'
    ELSE 'DISABLED'
  END as status;
