-- =====================================================
-- DIAGNOSTIC SCRIPT - Messages Feature
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose the issue

-- =====================================================
-- STEP 1: Check if tables exist and have RLS enabled
-- =====================================================

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'conversation_participants', 'messages', 'users')
ORDER BY tablename;

-- Expected: All tables should show rls_enabled = true

-- =====================================================
-- STEP 2: Check current RLS policies
-- =====================================================

SELECT
  tablename,
  policyname,
  cmd as policy_type,
  CASE
    WHEN cmd = 'SELECT' THEN 'Viewing/Reading'
    WHEN cmd = 'INSERT' THEN 'Creating'
    WHEN cmd = 'UPDATE' THEN 'Updating'
    WHEN cmd = 'DELETE' THEN 'Deleting'
  END as operation
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, cmd;

-- Expected: Should see policies for SELECT and INSERT on both tables

-- =====================================================
-- STEP 3: Check if users table has your user
-- =====================================================

SELECT
  id,
  email,
  display_name,
  avatar_url,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Should see your user and other users you're trying to chat with

-- =====================================================
-- STEP 4: Check existing conversations
-- =====================================================

SELECT
  id,
  participant_ids,
  is_group,
  name,
  created_by,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Recent conversation attempts should appear here

-- =====================================================
-- STEP 5: Check existing participants
-- =====================================================

SELECT
  cp.id,
  cp.conversation_id,
  cp.user_id,
  u.display_name,
  u.email,
  c.created_at as conversation_created_at
FROM conversation_participants cp
LEFT JOIN users u ON u.id = cp.user_id
LEFT JOIN conversations c ON c.id = cp.conversation_id
ORDER BY c.created_at DESC
LIMIT 20;

-- Expected: Should see participant records matching conversations
-- If conversations exist but NO participants → INSERT is failing
-- If participants exist but query returns empty in app → RLS SELECT is blocking

-- =====================================================
-- STEP 6: Test if RLS is blocking reads
-- =====================================================

-- This query bypasses RLS to see actual data
SET ROLE postgres;

SELECT
  cp.id,
  cp.conversation_id,
  cp.user_id,
  c.participant_ids,
  c.created_at
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
ORDER BY c.created_at DESC
LIMIT 10;

RESET ROLE;

-- Compare this with Step 5 results
-- If Step 5 is empty but Step 6 shows data → RLS is blocking

-- =====================================================
-- STEP 7: Check foreign key constraints
-- =====================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'conversation_participants';

-- Expected:
-- user_id → users.id
-- conversation_id → conversations.id

-- =====================================================
-- STEP 8: Manual schema verification
-- =====================================================

-- NOTE: Step 8 cannot test INSERT/SELECT in SQL Editor because auth.uid()
-- is not available outside of authenticated API requests.
-- The real test happens in Step 3 of MESSAGES_DEBUG_GUIDE.md

-- Instead, let's verify the schema is correct:

-- Check conversation_participants columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NO, gen_random_uuid())
-- conversation_id (uuid, NO, NULL)
-- user_id (uuid, NO, NULL)
-- unread_count (integer, YES, 0)
-- last_read_at (timestamp, YES, NULL)

-- Check conversations columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NO, gen_random_uuid())
-- created_by (uuid, NO, NULL) or (uuid, YES, NULL)
-- is_group (boolean, YES, false)
-- participant_ids (ARRAY, YES, NULL)
-- name (text, YES, NULL)
-- created_at (timestamp, YES, now())
-- updated_at (timestamp, YES, now())

-- =====================================================
-- SUMMARY OF DIAGNOSTICS
-- =====================================================

-- Copy ALL results from Steps 1-8 and send to developer
-- Pay special attention to:
-- 1. Are RLS policies enabled? (Step 1)
-- 2. Do policies exist? (Step 2)
-- 3. Does your user exist in users table? (Step 3)
-- 4. Do conversations exist? (Step 4)
-- 5. Do participants exist? (Step 5)
-- 6. Does Step 6 show more data than Step 5? (RLS blocking)
-- 7. Are foreign keys set up? (Step 7)
-- 8. What NOTICES appear in Step 8? (Manual test)
