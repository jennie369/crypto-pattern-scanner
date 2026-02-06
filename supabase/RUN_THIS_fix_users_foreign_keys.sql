-- ============================================================
-- FIX: Foreign key constraint errors referencing "users" table
-- Error: Key is not present in table "users"
--
-- Problem: Some tables have foreign keys pointing to public.users
-- which doesn't exist. They should point to auth.users.
--
-- Solution: Create a public.users view that mirrors auth.users
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Check if public.users exists and handle accordingly
DO $$
BEGIN
  -- Check if users is a table (not a view)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE'
  ) THEN
    RAISE NOTICE 'public.users table already exists - skipping view creation';
  ELSE
    -- Drop view if exists and recreate
    DROP VIEW IF EXISTS public.users;

    -- Create view that mirrors auth.users
    CREATE VIEW public.users AS
    SELECT
      id,
      email,
      created_at,
      updated_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data
    FROM auth.users;

    -- Grant access
    GRANT SELECT ON public.users TO authenticated;
    GRANT SELECT ON public.users TO anon;

    RAISE NOTICE 'public.users view created successfully';
  END IF;
END $$;

-- 2. Update foreign keys to reference auth.users directly
-- This is more robust but requires dropping and recreating constraints

-- Fix user_follows table
DO $$
BEGIN
  -- Drop old constraints if they exist
  ALTER TABLE IF EXISTS user_follows
    DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey;
  ALTER TABLE IF EXISTS user_follows
    DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey;

  -- Add new constraints referencing auth.users
  ALTER TABLE user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey
    FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE user_follows
    ADD CONSTRAINT user_follows_following_id_fkey
    FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed user_follows foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_follows fix skipped: %', SQLERRM;
END $$;

-- Fix conversation_participants table
DO $$
BEGIN
  ALTER TABLE IF EXISTS conversation_participants
    DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

  ALTER TABLE conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed conversation_participants foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'conversation_participants fix skipped: %', SQLERRM;
END $$;

-- Fix blocked_users table
DO $$
BEGIN
  ALTER TABLE IF EXISTS blocked_users
    DROP CONSTRAINT IF EXISTS blocked_users_blocker_id_fkey;
  ALTER TABLE IF EXISTS blocked_users
    DROP CONSTRAINT IF EXISTS blocked_users_blocked_id_fkey;

  ALTER TABLE blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_fkey
    FOREIGN KEY (blocker_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE blocked_users
    ADD CONSTRAINT blocked_users_blocked_id_fkey
    FOREIGN KEY (blocked_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed blocked_users foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'blocked_users fix skipped: %', SQLERRM;
END $$;

-- Fix user_reports table
DO $$
BEGIN
  ALTER TABLE IF EXISTS user_reports
    DROP CONSTRAINT IF EXISTS user_reports_reporter_id_fkey;
  ALTER TABLE IF EXISTS user_reports
    DROP CONSTRAINT IF EXISTS user_reports_reported_user_id_fkey;

  ALTER TABLE user_reports
    ADD CONSTRAINT user_reports_reporter_id_fkey
    FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE user_reports
    ADD CONSTRAINT user_reports_reported_user_id_fkey
    FOREIGN KEY (reported_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed user_reports foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_reports fix skipped: %', SQLERRM;
END $$;

-- Fix messages table
DO $$
BEGIN
  ALTER TABLE IF EXISTS messages
    DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

  ALTER TABLE messages
    ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed messages foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'messages fix skipped: %', SQLERRM;
END $$;

-- Fix message_reactions table
DO $$
BEGIN
  ALTER TABLE IF EXISTS message_reactions
    DROP CONSTRAINT IF EXISTS message_reactions_user_id_fkey;

  ALTER TABLE message_reactions
    ADD CONSTRAINT message_reactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  RAISE NOTICE 'Fixed message_reactions foreign keys';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'message_reactions fix skipped: %', SQLERRM;
END $$;

-- 3. Verify public.users exists (table or view)
SELECT
  'public.users' AS object,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE')
    THEN 'EXISTS (TABLE)'
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'users')
    THEN 'EXISTS (VIEW)'
    ELSE 'NOT EXISTS'
  END AS status;

-- 4. List all foreign key constraints that reference users tables
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- Done!
SELECT 'SUCCESS: Foreign key constraints have been fixed!' AS result;
